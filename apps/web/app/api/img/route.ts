import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY as string);
console.log(process.env.PEXELS_API_KEY);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const type =
    request.nextUrl.searchParams.get("type")?.toLowerCase() || "image";

  if (type !== "image" && type !== "video") {
    return NextResponse.json({ data: [] });
  }

  if (type === "image") {
    const photos: any = await client.photos.search({
      query: query || "shiva",
      per_page: query ? 30 : 30,
      page: query ? 1 : 2,
    });
    const photosData = photos.photos.map((photo: any) => {
      return {
        id: photo.id,
        url: photo.src.original,
        displayUrl: photo.src.medium,
        alt: photo.alt,
      };
    });
    console.log({ photosData });
    return NextResponse.json({ data: photosData });
  }

  if (type === "video") {
    const result: any = await client.videos.search({
      query: query || "shiva",
      per_page: query ? 30 : 30,
      page: query ? 1 : 2,
    });
    const videosData = result.videos.map((video: any) => {
      const videoFiles = video.video_files
      // return videoFiles
      return {
        id: video.id,
        url: video.src.original,
        displayUrl: video.src.medium,
        alt: video.alt,
      };
    });

    return NextResponse.json({ data: videosData });
  }

  return NextResponse.json({ data: [] });
}
