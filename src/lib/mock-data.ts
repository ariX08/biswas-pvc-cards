import type { BusinessSettings, CardType } from "@/types";

export const MOCK_SETTINGS: BusinessSettings = {
  business_name: "Biswas PVC Cards",
  upi_id: "biswaspvc@upi",
  upi_qr_url: null,
  advance_percentage: 100,
  delivery_charge: 50,
  free_delivery_min_quantity: 10,
  phone: "+91 91238 98712",
  email: "biswascybercafe0615@gmail.com",
  address: "Biswas Cyber Cafe, Kolkata, West Bengal",
};

export const MOCK_CARDS: CardType[] = [
  {
    id: "mock-1",
    name: "Voter ID Card",
    slug: "voter-id",
    description: "High quality PVC reprint of your Voter ID card.",
    price: 99,
    image_url: null,
    required_documents: "Clear PDF or photo of original Voter ID",
    instructions: "Upload front side clearly.",
    active: true,
    category: "Government",
  },
  {
    id: "mock-2",
    name: "PAN Card",
    slug: "pan-card",
    description: "Durable PVC PAN card reprint.",
    price: 99,
    image_url: null,
    required_documents: "PDF of PAN card",
    instructions: "Ensure name and number are readable.",
    active: true,
    category: "Government",
  },
  {
    id: "mock-3",
    name: "Driving Licence",
    slug: "driving-licence",
    description: "PVC Driving Licence card.",
    price: 129,
    image_url: null,
    required_documents: "PDF of both sides if required",
    instructions: "Upload clear scans.",
    active: true,
    category: "Government",
  },
];
