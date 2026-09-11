/*
 * Where the photographs come from.
 *
 * Every picture in the image games is from Wikimedia Commons. Most carry a
 * Creative Commons licence that asks for the author's name, so the app shows
 * this list rather than quietly using the work: the profile screen links each
 * photo back to its page on Commons.
 */
export interface PhotoCredit {
  id: string;
  file: string;
  author: string;
  licence: string;
  page: string;
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  { id: "apple", file: "Alexander (apple).jpg", author: "Aron Ambrosiani", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File%3AAlexander%20(apple).jpg" },
  { id: "bicycle", file: "Left_side_of_Flying_Pigeon.jpg", author: "齐健 from Peking, People's Republic of China", licence: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Left_side_of_Flying_Pigeon.jpg" },
  { id: "book", file: "Acordo ortografico PT.jpg", author: "Manuel de Sousa", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File%3AAcordo%20ortografico%20PT.jpg" },
  { id: "bottle", file: "Bouteille.jpg", author: "Aurélien Mole", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:Bouteille.jpg" },
  { id: "brokenWindow", file: "Alboni street in Paris throught a broken glass.JPG", author: "Oliver H", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File%3AAlboni%20street%20in%20Paris%20throught%20a%20broken%20glass.JPG" },
  { id: "bulb", file: "Gluehlampe_01_KMJ.png", author: "KMJ, alpha masking by Edokter", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:Gluehlampe_01_KMJ.png" },
  { id: "camera", file: "LEI0440_Leica_IIIf_chrom_-_Sn._580566_1951-52-M39_Blitzsynchron_front_view-6531_hf-.jpg", author: "Kameraprojekt Graz 2015", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:LEI0440_Leica_IIIf_chrom_-_Sn._580566_1951-52-M39_Blitzsynchron_front_view-6531_hf-.jpg" },
  { id: "clock", file: "Aeg-peter-behrens-uhr-wallclock.jpg", author: "Christos Vittoratos", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File%3AAeg-peter-behrens-uhr-wallclock.jpg" },
  { id: "faucet", file: "Wasserhahn.jpg", author: "Matthew Bowden www.digitallyrefreshing.com", licence: "Attribution", page: "https://commons.wikimedia.org/wiki/File:Wasserhahn.jpg" },
  { id: "flatTire", file: "2008-08-19 Flat tire.jpg", author: "Ildar Sagdejev (Specious)", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File%3A2008-08-19%20Flat%20tire.jpg" },
  { id: "helmet", file: "Bicycle_Helmet_0085.jpg", author: "Ashley Pomeroy", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Bicycle_Helmet_0085.jpg" },
  { id: "microscope", file: "Ukrainian_microscope_(cropped).jpg", author: "Ann 2000", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Ukrainian_microscope_(cropped).jpg" },
  { id: "robot", file: "HONDA_ASIMO.jpg", author: "Gnsin", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:HONDA_ASIMO.jpg" },
  { id: "rocket", file: "Soyuz_TMA-9_launch.jpg", author: "Bill Ingalls", licence: "Public domain", page: "https://commons.wikimedia.org/wiki/File:Soyuz_TMA-9_launch.jpg" },
  { id: "skyscraper", file: "GE_Building_by_David_Shankbone.JPG", author: "David Shankbone", licence: "Public domain", page: "https://commons.wikimedia.org/wiki/File:GE_Building_by_David_Shankbone.JPG" },
  { id: "submarine", file: "US_Navy_040730-N-1234E-002_PCU_Virginia_(SSN_774)_returns_to_the_General_Dynamics_Electric_Boat_shipyard.jpg", author: "U.S. Navy photo by General Dynamics Electric Boat", licence: "Public domain", page: "https://commons.wikimedia.org/wiki/File:US_Navy_040730-N-1234E-002_PCU_Virginia_(SSN_774)_returns_to_the_General_Dynamics_Electric_Boat_shipyard.jpg" },
  { id: "suitcase", file: "Suitcase1.jpg", author: "JEXP", licence: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:Suitcase1.jpg" },
  { id: "trafficLight", file: "Modern_British_LED_Traffic_Light.jpg", author: "Unisouth", licence: "CC BY 3.0", page: "https://commons.wikimedia.org/wiki/File:Modern_British_LED_Traffic_Light.jpg" },
];
