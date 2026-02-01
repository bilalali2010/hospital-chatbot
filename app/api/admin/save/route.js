

import { setBusinessData } from "../../memory";

export async function POST(req) {
  const { businessData, password } = await req.json();

  if (password !== "@supersecret") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  setBusinessData(businessData);

  return Response.json({ success: true });
}
