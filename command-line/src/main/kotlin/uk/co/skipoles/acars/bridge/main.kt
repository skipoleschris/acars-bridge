package uk.co.skipoles.acars.bridge

import dev.forkhandles.result4k.*
import kotlinx.cli.ArgParser
import kotlinx.cli.ArgType
import kotlinx.cli.default
import kotlinx.cli.required
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    val config = parseConfig(args)
    val eventReceiver = createEventReceiver()
    val debug = if (config.debug) { msg: String -> println("DEBUG - $msg") } else { _ -> }
    runBridge(config, debug, eventReceiver)
}

private fun runBridge(
    config: Config,
    debug: (String) -> Unit,
    eventReceiver: EventReceiver
) {
    // Initialise
    val callSign = obtainCallSign(config, debug)
    eventReceiver.notifyCallSign(callSign)
    eventReceiver.notifyATSUId(config.atsuId)

    // Create ACARS clients
    val sayIntentionsClient = ACARSClient("ATSU", "acars.sayintentions.ai", config.sayIntentionsApiKey, debug)
    val hoppieClient = ACARSClient("Airplane", "www.hoppie.nl", config.hoppieApiKey, debug)

    // Run the bridge
    val bridge = Bridge(hoppieClient, sayIntentionsClient, callSign, config.atsuId, eventReceiver, debug)
    bridge.start()
}

private fun parseConfig(args: Array<String>): Config {
    val parser = ArgParser("acars-bridge")

    val sayIntentionsApiKey by parser.option(
        ArgType.String,
        shortName = "k",
        description = "Say Intentions API key"
    ).required()

    val hoppieApiKey by parser.option(
        ArgType.String,
        shortName = "l",
        description = "Hoppie ACARS API key"
    ).required()

    val simBriefPilotId by parser.option(
        ArgType.String,
        shortName = "p",
        description = "SimBrief Pilot ID (or pass callSign directly)"
    )

    val callSign by parser.option(
        ArgType.String,
        shortName = "c",
        description = "Flight call sign (or set SimBrief Pilot ID)"
    )

    val atsuId by parser.option(
        ArgType.String,
        shortName = "a",
        description = "ATSU ID (in SayIntentions.ai platform)"
    ).default("PKGM")

    val debug by parser.option(
        ArgType.Boolean,
        shortName = "d",
        description = "Enable debug output"
    ).default(false)

    parser.parse(args)

    if (simBriefPilotId == null && callSign == null) {
        println("Either SimBrief Pilot ID or Flight Call Sign must be provided.")
        println("Prefer SimBrief Pilot ID for more reliable results as this is where SayIntentions.ai gets its copy of the call sign from.")
        exitProcess(127)
    }
    return Config(sayIntentionsApiKey, hoppieApiKey, simBriefPilotId, callSign, atsuId, debug)
}

private fun createEventReceiver(): EventReceiver {
    return object : EventReceiver {
        override fun notifyCallSign(callSign: String) {
            println("Current flight call sign: $callSign")
        }

        override fun notifyATSUId(atsuId: String) {
            println("ATSU ID: $atsuId")
        }

        override fun notifyMessageRouted(
            fromPurpose: String,
            toPurpose: String,
            fromId: String,
            toId: String,
            message: Message
        ) {
            println("Message routed from $fromPurpose ($fromId) to $toPurpose ($toId): $message")
        }

        override fun notifyFailedPoll(purpose: String) {
            println("Failed to poll $purpose")
        }

        override fun notifyFailedSend(purpose: String) {
            println("Failed to send $purpose")
        }
    }
}

private fun obtainCallSign(
    config: Config,
    debug: (String) -> Unit
): String =
    if (config.simBriefPilotId != null) {
        val simBriefClient = SimBriefClient(config.simBriefPilotId, debug)
        simBriefClient.activeFlightPlanCallSign()
            .peekFailure { debug("$it") }
            .valueOrNull() ?: run {
                println("Failed to get active flight plan call sign.")
                exitProcess(1)
            }
    }
    else config.callSign!!
