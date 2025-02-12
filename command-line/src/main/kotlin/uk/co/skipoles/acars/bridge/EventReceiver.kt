package uk.co.skipoles.acars.bridge

interface EventReceiver {
    fun notifyCallSign(callSign: String)
    fun notifyATSUId(atsuId: String)
    fun notifyMessageRouted(
        fromPurpose: String,
        toPurpose: String,
        fromId: String,
        toId: String,
        message: Message
    )
    fun notifyFailedPoll(purpose: String)
    fun notifyFailedSend(purpose: String)
}