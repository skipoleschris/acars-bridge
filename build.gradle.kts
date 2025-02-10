plugins {
    kotlin("jvm") version "2.1.0"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.http4k:http4k-client-okhttp:5.47.0.0")
    implementation("dev.forkhandles:result4k:2.20.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-cli-jvm:0.3.6")

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}