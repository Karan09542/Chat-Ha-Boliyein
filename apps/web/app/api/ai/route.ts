import { NextResponse } from "next/server";

import {generateResponse} from "../../../service/model/gemini"

export async function POST(request: Request) {
	let data = await request.json()
	const res = await generateResponse(data.input)
	return NextResponse.json(res)

}
