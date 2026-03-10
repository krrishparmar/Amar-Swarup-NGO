export const kpiData = [
  { label: 'Total Waste Collected', value: 24850, suffix: ' kg', icon: '♻️' },
  { label: "Today's Scheduled Pickups", value: 18, suffix: '', icon: '📅' },
  { label: 'Active WhatsApp Leads', value: 142, suffix: '', icon: '💬' },
  { label: 'Total Donors Registered', value: 1287, suffix: '', icon: '🤝' },
  { label: 'Pickups Completed This Month', value: 364, suffix: '', icon: '✅' },
];

export const wasteTypes = ['E-Waste', 'Plastic', 'Paper', 'Metal', 'Mixed'];

export const nagpurLocations = [
  'Dharampeth', 'Sitabuldi', 'Sadar', 'Manewada', 'Hingna',
  'Wardhaman Nagar', 'Ramdaspeth', 'Civil Lines', 'Laxmi Nagar',
  'Trimurti Nagar', 'Pratap Nagar', 'Bajaj Nagar', 'Nandanvan',
  'Hudkeshwar', 'Jaripatka', 'Itwari', 'Mahal', 'Gandhibagh',
];

export const whatsappLeads = [
  { id: 1, name: 'Rajesh Deshmukh', location: 'Dharampeth', phone: '+91 98XXX XX234', wasteType: 'E-Waste', date: '2025-03-10', time: '10:00 AM', weight: 12.5, status: 'Confirmed' },
  { id: 2, name: 'Priya Wankhede', location: 'Sitabuldi', phone: '+91 90XXX XX891', wasteType: 'Plastic', date: '2025-03-10', time: '11:30 AM', weight: 8.2, status: 'Pending' },
  { id: 3, name: 'Amit Gajbhiye', location: 'Manewada', phone: '+91 77XXX XX456', wasteType: 'Paper', date: '2025-03-10', time: '02:00 PM', weight: 22.0, status: 'Completed' },
  { id: 4, name: 'Sneha Raut', location: 'Sadar', phone: '+91 88XXX XX321', wasteType: 'Metal', date: '2025-03-10', time: '03:30 PM', weight: 15.7, status: 'Confirmed' },
  { id: 5, name: 'Vikram Thakre', location: 'Civil Lines', phone: '+91 93XXX XX789', wasteType: 'E-Waste', date: '2025-03-10', time: '04:00 PM', weight: 5.3, status: 'Pending' },
  { id: 6, name: 'Anita Borkar', location: 'Ramdaspeth', phone: '+91 81XXX XX112', wasteType: 'Mixed', date: '2025-03-11', time: '09:00 AM', weight: 18.9, status: 'Pending' },
  { id: 7, name: 'Rahul Meshram', location: 'Wardhaman Nagar', phone: '+91 70XXX XX667', wasteType: 'Plastic', date: '2025-03-11', time: '10:30 AM', weight: 9.4, status: 'Cancelled' },
  { id: 8, name: 'Deepa Khandelwal', location: 'Laxmi Nagar', phone: '+91 85XXX XX543', wasteType: 'Paper', date: '2025-03-11', time: '01:00 PM', weight: 30.0, status: 'Completed' },
  { id: 9, name: 'Suresh Yadav', location: 'Trimurti Nagar', phone: '+91 96XXX XX876', wasteType: 'Metal', date: '2025-03-12', time: '11:00 AM', weight: 7.1, status: 'Confirmed' },
  { id: 10, name: 'Kavita Pande', location: 'Pratap Nagar', phone: '+91 73XXX XX998', wasteType: 'E-Waste', date: '2025-03-12', time: '12:30 PM', weight: 14.6, status: 'Pending' },
  { id: 11, name: 'Nikhil Dongre', location: 'Bajaj Nagar', phone: '+91 82XXX XX145', wasteType: 'Mixed', date: '2025-03-12', time: '03:00 PM', weight: 25.3, status: 'Completed' },
  { id: 12, name: 'Meena Wasnik', location: 'Hingna', phone: '+91 91XXX XX332', wasteType: 'Plastic', date: '2025-03-13', time: '09:30 AM', weight: 11.8, status: 'Pending' },
];

export const donors = [
  { rank: 1, name: 'Rajesh Deshmukh', city: 'Nagpur', totalKg: 185.4, points: 1854, tier: 'champion' },
  { rank: 2, name: 'Deepa Khandelwal', city: 'Nagpur', totalKg: 162.0, points: 1620, tier: 'champion' },
  { rank: 3, name: 'Nikhil Dongre', city: 'Nagpur', totalKg: 148.7, points: 1487, tier: 'guardian' },
  { rank: 4, name: 'Anita Borkar', city: 'Nagpur', totalKg: 124.3, points: 1243, tier: 'guardian' },
  { rank: 5, name: 'Sneha Raut', city: 'Nagpur', totalKg: 98.5, points: 985, tier: 'guardian' },
  { rank: 6, name: 'Amit Gajbhiye', city: 'Nagpur', totalKg: 76.2, points: 762, tier: 'guardian' },
  { rank: 7, name: 'Suresh Yadav', city: 'Nagpur', totalKg: 45.8, points: 458, tier: 'recycler' },
  { rank: 8, name: 'Priya Wankhede', city: 'Nagpur', totalKg: 38.1, points: 381, tier: 'recycler' },
  { rank: 9, name: 'Kavita Pande', city: 'Nagpur', totalKg: 22.9, points: 229, tier: 'recycler' },
  { rank: 10, name: 'Vikram Thakre', city: 'Nagpur', totalKg: 8.4, points: 84, tier: 'seedling' },
];

export const activityFeed = [
  { id: 1, donor: 'Rajesh Deshmukh', location: 'Dharampeth', wasteType: 'E-Waste', time: '2 mins ago', weight: '12.5 kg' },
  { id: 2, donor: 'Priya Wankhede', location: 'Sitabuldi', wasteType: 'Plastic', time: '8 mins ago', weight: '8.2 kg' },
  { id: 3, donor: 'Amit Gajbhiye', location: 'Manewada', wasteType: 'Paper', time: '15 mins ago', weight: '22 kg' },
  { id: 4, donor: 'Sneha Raut', location: 'Sadar', wasteType: 'Metal', time: '23 mins ago', weight: '15.7 kg' },
  { id: 5, donor: 'Vikram Thakre', location: 'Civil Lines', wasteType: 'E-Waste', time: '31 mins ago', weight: '5.3 kg' },
  { id: 6, donor: 'Anita Borkar', location: 'Ramdaspeth', wasteType: 'Mixed', time: '45 mins ago', weight: '18.9 kg' },
  { id: 7, donor: 'Rahul Meshram', location: 'Wardhaman Nagar', wasteType: 'Plastic', time: '1 hr ago', weight: '9.4 kg' },
  { id: 8, donor: 'Deepa Khandelwal', location: 'Laxmi Nagar', wasteType: 'Paper', time: '1.5 hrs ago', weight: '30 kg' },
  { id: 9, donor: 'Suresh Yadav', location: 'Trimurti Nagar', wasteType: 'Metal', time: '2 hrs ago', weight: '7.1 kg' },
  { id: 10, donor: 'Meena Wasnik', location: 'Hingna', wasteType: 'Plastic', time: '3 hrs ago', weight: '11.8 kg' },
];

export function getTierInfo(tier) {
  const tiers = {
    seedling: { label: '🌱 Seedling', min: 0, max: 10, color: '#4ade80' },
    recycler: { label: '♻️ Recycler', min: 11, max: 50, color: '#38bdf8' },
    guardian: { label: '🌍 Earth Guardian', min: 51, max: 150, color: '#c084fc' },
    champion: { label: '⚡ Eco Champion', min: 151, max: 500, color: '#f59e0b' },
  };
  return tiers[tier] || tiers.seedling;
}

export function getTierProgress(totalKg) {
  if (totalKg <= 10) return { current: totalKg, max: 10, next: 'Recycler' };
  if (totalKg <= 50) return { current: totalKg - 10, max: 40, next: 'Earth Guardian' };
  if (totalKg <= 150) return { current: totalKg - 50, max: 100, next: 'Eco Champion' };
  return { current: totalKg, max: totalKg, next: null };
}
