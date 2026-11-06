import { NextResponse } from "next/server";
/** Public results are returned once, never placed in a shared cross-user task store. */
export async function GET() {
 return NextResponse.json({error:"Public task history is not stored. Use the original response or download your result."},
  {status:410,headers:{"Cache-Control":"no-store, private"}});
}
