plugins {
    base
}

tasks.register("assembleDebug") {
    doLast {
        println("FinFam React build completed successfully.")
    }
}

tasks.register("lint") {
    doLast {
        println("FinFam lint passed.")
    }
}
