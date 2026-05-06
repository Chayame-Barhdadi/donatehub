export interface DonationItem {
  id?: number;
  title: string;
  description: string;
  category: string;
  city: string;
  status: string;
  imageUrl?: string;
  user?: {
    id: number;
    name: string;
  };
}
