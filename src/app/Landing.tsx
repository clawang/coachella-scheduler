'use client'
import React from "react"
import Link from "next/link"
import { Button } from "./components/button"

export default function LandingPage() {
    return (
        <div className="landing-page">
            <div className="landing-text">
                <h1>Coachella Scheduler</h1>
                <h2>Log in to create your schedule and share with your friends!</h2>
                <Link href="/login"><Button>Log in to start</Button></Link>
                <div className="landing-disclaimer">
                    <p>For Coachella 2025 Weekend 2.</p>
                    <p>Not affiliated with Coachella.</p>
                </div>
            </div>
            <img src="/palms.svg" className="palm-img" />
            <img src="/footer.png" className="footer-img" />
        </div>
    )
}