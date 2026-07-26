package data

var dayNames = map[int]string{
	1: "Senin",
	2: "Selasa",
	3: "Rabu",
	4: "Kamis",
	5: "Jumat",
	6: "Sabtu",
	7: "Minggu",
}

func GetDayName(day int) string {
	name, ok := dayNames[day]
	if !ok {
		return "Unknown"
	}
	return name
}
