package uk.co.skipoles.acars.bridge

import dev.forkhandles.result4k.Failure
import dev.forkhandles.result4k.Result
import dev.forkhandles.result4k.Success
import org.http4k.client.OkHttp
import org.http4k.core.Method
import org.http4k.core.Request
import org.http4k.core.Status

class SimBriefClient(
    private val pilotId: String,
    private val debug: (String) -> Unit
) {
    private val callSignRegex = "<callsign>([A-Z0-9\\-]+)</callsign>".toRegex()
    private val client = OkHttp()

    fun activeFlightPlanCallSign(): Result<String, ClientError> {
        debug("obtaining SimBrief flight plan for pilot $pilotId")
        val request = Request(Method.GET, "https://www.simbrief.com/api/xml.fetcher.php")
            .query("userid", pilotId)
        val response = client(request)

        return if (response.status == Status.OK) {
            callSignRegex.find(response.bodyString())?.let {
                val callSign = it.groupValues[1]
                debug("active flight plan call sign: $callSign")
                Success(callSign)
            } ?: run {
                debug("unable to find call sign in returned flight plan")
                debug("flight plan: ${response.bodyString()}")
                Failure(ClientError(404, "No active flight plan"))
            }
        } else {
            debug("error calling SimBrief API: ${response.status.code} - ${response.bodyString()}")
            Failure(ClientError(response.status.code, response.bodyString()))
        }
    }
}