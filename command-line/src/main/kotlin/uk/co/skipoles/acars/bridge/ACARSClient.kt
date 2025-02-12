package uk.co.skipoles.acars.bridge

import org.http4k.client.OkHttp
import org.http4k.core.Method
import org.http4k.core.Request
import org.http4k.core.Status
import dev.forkhandles.result4k.Result
import dev.forkhandles.result4k.Success
import dev.forkhandles.result4k.Failure

class ACARSClient(
    val purpose: String,
    private val hostname: String,
    private val logonKey: String,
    private val debug: (String) -> Unit
) {
    private val pollRegex = "\\{([A-Z0-9]+)\\s([a-z\\-]+) \\{([^\\}]+)}\\}+".toRegex()
    private val client = OkHttp()

    fun poll(
        forCallSign: String,
        fromCallSign: String
    ): Result<List<Message>, ClientError> {
        debug("polling $purpose ACARS for new messages for $forCallSign from $fromCallSign")
        val request = Request(Method.GET, "https://$hostname/acars/system/connect.html")
            .query("logon", logonKey)
            .query("from", forCallSign)
            .query("to", fromCallSign)
            .query("type", "poll")
        val response = client(request)

        return if (response.status == Status.OK) {
            val messages = convertMessages(response.bodyString())
            debug("received ${messages.size} messages")
            messages.forEach { debug("    $it") }
            Success(messages)
        } else {
            debug("error calling ACARS API: ${response.status.code} - ${response.bodyString()}")
            Failure(ClientError(response.status.code, response.bodyString()))
        }
    }

    private fun convertMessages(body: String): List<Message> =
        pollRegex.findAll(body).map { match ->
            Message(
                match.groupValues[1],
                match.groupValues[2],
                match.groupValues[3]
            )
        }.toList()

    fun send(
        to: String,
        message: Message
    ): Result<Unit, ClientError> {
        debug("sending to $to on $purpose ACARS: $message")
        val request = Request(Method.GET, "https://$hostname/acars/system/connect.html")
            .query("logon", logonKey)
            .query("from", message.from)
            .query("to", to)
            .query("type", message.type)
            .query("packet", message.packet)
        val response = client(request)

        return if (response.status == Status.OK) {
            val body = response.bodyString()
            if (body == "ok") {
                debug("message sent successfully")
                Success(Unit)
            }
            else {
                debug("error sending message: $body")
                Failure(ClientError(response.status.code, body.drop(7).dropLast(1)))
            }
        } else {
            debug("error calling ACARS API: ${response.status.code} - ${response.bodyString()}")
            Failure(ClientError(response.status.code, response.bodyString()))
        }
    }
}

