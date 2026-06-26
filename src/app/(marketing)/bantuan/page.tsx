import type { Metadata } from "next"
import { BantuanClient } from "./BantuanClient"

export const metadata: Metadata = {
  title: "Bantuan | Sribuai APIRouter",
  description: "FAQ dan pusat bantuan Sribuai APIRouter.",
}

export default function BantuanPage() {
  return <BantuanClient />
}
