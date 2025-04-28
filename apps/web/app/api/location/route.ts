import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const response = await fetch("https://ipapi.co/json/");
	const data = await response.json();
	return NextResponse.json(data); 
}