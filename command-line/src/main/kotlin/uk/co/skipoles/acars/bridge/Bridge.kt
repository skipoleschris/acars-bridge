package uk.co.skipoles.acars.bridge

import dev.forkhandles.result4k.mapFailure
import dev.forkhandles.result4k.valueOrNull
import java.time.Instant

class Bridge(
    private val airplaneSideClient: ACARSClient,
    private val atsuSideClient: ACARSClient,
    private val callSign: String,
    private val atsuId: String,
    private val eventReceiver: EventReceiver,
    private val debug: (String) -> Unit
) {
    private var nextAirplaneACARSPollTime: Instant
    private var nextATSUACARSPollTime: Instant

    init {
        val now = Instant.now()
        nextAirplaneACARSPollTime = now
        nextATSUACARSPollTime = now
    }

    fun start() {
        while (true) {
            val now = Instant.now()

            val expectATSUReply = if (now.isAfter(nextAirplaneACARSPollTime)) {
                nextAirplaneACARSPollTime = now.plusSeconds(60L)
                debug("polling airplane ACARS system. next poll at: $nextAirplaneACARSPollTime")
                routeFromAirplaneToATSU()
            } else false

            val expectAirplaneReply = if (now.isAfter(nextATSUACARSPollTime)) {
                nextATSUACARSPollTime = now.plusSeconds(60L)
                debug("polling ATSU ACARS system. next poll at: $nextATSUACARSPollTime")
                routeFromATSUToAirplane()
            } else false

            if (expectATSUReply) {
                val pollTime = now.plusSeconds(20L)
                if (pollTime.isBefore(nextATSUACARSPollTime)) {
                    debug("triggering early ATSU poll at $pollTime")
                    nextATSUACARSPollTime = pollTime
                }
            }

            if (expectAirplaneReply) {
                val pollTime = now.plusSeconds(20L)
                if (pollTime.isBefore(nextAirplaneACARSPollTime)) {
                    debug("triggering early airplane poll at $pollTime")
                    nextAirplaneACARSPollTime = pollTime
                }
            }

            Thread.sleep(1000L)
        }
    }

    private fun routeFromAirplaneToATSU() =
        routeMessages(airplaneSideClient, atsuSideClient, atsuId, callSign)

    private fun routeFromATSUToAirplane() =
        routeMessages(atsuSideClient, airplaneSideClient, callSign, atsuId)

    private fun routeMessages(
        fromClient: ACARSClient,
        toClient: ACARSClient,
        forCallSign: String,
        fromCallSign: String
    ): Boolean {
        var messagesRouted = false
        (fromClient.poll(forCallSign, fromCallSign)
            .mapFailure { debug("$it") }
            .valueOrNull() ?: run {
                eventReceiver.notifyFailedPoll(fromClient.purpose)
                emptyList()
            })
            .forEach { message ->
                debug("transferring message to $forCallSign: $message")
                messagesRouted = true
                eventReceiver.notifyMessageRouted(fromClient.purpose, toClient.purpose, fromCallSign, forCallSign, message)
                toClient.send(forCallSign, message)
                    .mapFailure { debug("$it") }
                    .valueOrNull() ?: run {
                        eventReceiver.notifyFailedSend(toClient.purpose)
                    }
            }
        return messagesRouted
    }
}
