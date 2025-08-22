import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabaseClient"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isPostoProfileComplete(postoId: string): Promise<string[]> {
  const { data } = await supabase
    .from("postos")
    .select("endereco, bandeira, lat, lng")
    .eq("id", postoId)
    .single()

  const missing: string[] = []

  if (!data) {
    return ["Bandeira", "CEP", "Logradouro", "Número", "Bairro", "Cidade", "UF", "Latitude", "Longitude"]
  }

  const endereco = data.endereco || {}
  const enderecoFields = [
    { key: "cep", label: "CEP" },
    { key: "logradoudo", label: "Logradouro" },
    { key: "numero", label: "Número" },
    { key: "bairro", label: "Bairro" },
    { key: "cidade", label: "Cidade" },
    { key: "uf", label: "UF" },
  ] as const

  for (const { key, label } of enderecoFields) {
    if (!endereco[key]) missing.push(label)
  }

  if (!data.bandeira) missing.push("Bandeira")
  if (data.lat === null || data.lat === undefined || data.lat === "") missing.push("Latitude")
  if (data.lng === null || data.lng === undefined || data.lng === "") missing.push("Longitude")

  return missing
}

