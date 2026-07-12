// Curated list of major Indian Railways stations. Not exhaustive — used for
// autocomplete in the search form.
export const STATIONS: Array<{ code: string; name: string; city: string }> = [
  { code: "NDLS", name: "New Delhi", city: "Delhi" },
  { code: "NZM", name: "H Nizamuddin", city: "Delhi" },
  { code: "DEE", name: "Delhi Sarai Rohilla", city: "Delhi" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai" },
  { code: "CSMT", name: "Mumbai CSMT", city: "Mumbai" },
  { code: "BDTS", name: "Bandra Terminus", city: "Mumbai" },
  { code: "HWH", name: "Howrah Jn", city: "Kolkata" },
  { code: "SDAH", name: "Sealdah", city: "Kolkata" },
  { code: "SHM", name: "Shalimar", city: "Kolkata" },
  { code: "MAS", name: "MGR Chennai Central", city: "Chennai" },
  { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
  { code: "YPR", name: "Yesvantpur Jn", city: "Bengaluru" },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad" },
  { code: "SC", name: "Secunderabad Jn", city: "Hyderabad" },
  { code: "ADI", name: "Ahmedabad Jn", city: "Ahmedabad" },
  { code: "GNC", name: "Gandhinagar Capital", city: "Gandhinagar" },
  { code: "PUNE", name: "Pune Jn", city: "Pune" },
  { code: "JP", name: "Jaipur Jn", city: "Jaipur" },
  { code: "LKO", name: "Lucknow", city: "Lucknow" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur" },
  { code: "BSB", name: "Varanasi Jn", city: "Varanasi" },
  { code: "ALD", name: "Prayagraj Jn", city: "Prayagraj" },
  { code: "PURI", name: "Puri", city: "Puri" },
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar" },
  { code: "VSKP", name: "Visakhapatnam", city: "Visakhapatnam" },
  { code: "TVC", name: "Trivandrum Central", city: "Thiruvananthapuram" },
  { code: "ERS", name: "Ernakulam Jn", city: "Kochi" },
  { code: "MYS", name: "Mysuru Jn", city: "Mysuru" },
  { code: "MAO", name: "Madgaon Jn", city: "Goa" },
  { code: "HBJ", name: "Bhopal Habibganj", city: "Bhopal" },
  { code: "JHS", name: "Jhansi Jn", city: "Jhansi" },
  { code: "ASR", name: "Amritsar Jn", city: "Amritsar" },
  { code: "FZR", name: "Firozpur Cant", city: "Firozpur" },
  { code: "SVDK", name: "Shri Mata V D Katra", city: "Katra" },
  { code: "RJPB", name: "Rajendra Nagar T", city: "Patna" },
  { code: "BSP", name: "Bilaspur Jn", city: "Bilaspur" },
  { code: "G", name: "Gondia Jn", city: "Gondia" },
];

export function findStation(codeOrName: string) {
  const q = codeOrName.toLowerCase().trim();
  return STATIONS.find(
    (s) =>
      s.code.toLowerCase() === q ||
      s.name.toLowerCase() === q ||
      s.city.toLowerCase() === q,
  );
}
