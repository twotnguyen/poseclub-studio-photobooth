export interface StudioConfig {
  brandName: string;
  subTitle: string;
  tagline: string;
  description: string;
  address: {
    street: string;
    cityStateZip: string;
    country: string;
    full: string;
  };
  mapsUrl: string;
  mapsEmbedUrl: string;
  instagram: {
    handle: string;
    url: string;
  };
  contact: {
    email: string;
  };
  hours: {
    days: string;
    daysVi: string;
    time: string;
  }[];
  boothHighlights: {
    title: string;
    description: string;
  }[];
}

export const STUDIO_CONFIG: StudioConfig = {
  brandName: "poseclub studio",
  subTitle: "editorial & minimalist photobooth",
  tagline: "Unfiltered elegance in timeless black & white.",
  description:
    "Experience the raw intimacy of vintage film aesthetics combined with contemporary editorial design. Capture memories instantly online or immerse yourself in our signature physical booths.",
  address: {
    street: "1327 S Harbor Blvd",
    cityStateZip: "Fullerton, CA 92832",
    country: "United States",
    full: "1327 S Harbor Blvd, Fullerton, CA 92832, United States",
  },
  mapsUrl: "https://maps.app.goo.gl/3gNnkCrQ4tVJrsrT7",
  mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.736938290374!2d-117.9261899235282!3d33.86937402725902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dd2a048705b76b%3A0x647c87c0ff7dfc85!2s1327%20S%20Harbor%20Blvd%2C%20Fullerton%2C%20CA%2092832%2C%20USA!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s",
  instagram: {
    handle: "@poseclub.photobooth",
    url: "https://www.instagram.com/poseclub.photobooth",
  },
  contact: {
    email: "hello@poseclubstudio.com",
  },
  hours: [
    { days: "Monday – Thursday", daysVi: "Thứ 2 – Thứ 5", time: "11:00 AM – 10:00 PM" },
    { days: "Friday – Saturday", daysVi: "Thứ 6 – Thứ 7", time: "11:00 AM – 11:00 PM" },
    { days: "Sunday", daysVi: "Chủ Nhật", time: "11:00 AM – 11:00 PM" },
  ],
  boothHighlights: [
    {
      title: "Signature Monochrome & Film Grain",
      description: "Custom calibrated high-contrast monochrome lighting tuned for fashion and editorial portraits.",
    },
    {
      title: "High-Angle & Classic Elevator Booths",
      description: "Distinct perspectives inspired by underground art culture and Tokyo-Seoul vintage photoboxes.",
    },
    {
      title: "Archival Quality Matte Prints",
      description: "Dye-sublimation print strips made to endure with waterproof, fingerprint-resistant finish.",
    },
  ],
};
