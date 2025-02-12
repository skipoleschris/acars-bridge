package uk.co.skipoles.acars.bridge

data class ClientError(
    val code: Int,
    val cause: String
)

data class Message(
    val from: String,
    val type: String,
    val packet: String
)

data class Config(
    val sayIntentionsApiKey: String,
    val hoppieApiKey: String,
    val simBriefPilotId: String?,
    val callSign: String?,
    val atsuId: String,
    val debug: Boolean
)
