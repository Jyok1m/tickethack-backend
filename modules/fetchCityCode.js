const fetchCityCode = async (cityName) => {
  let response = await fetch(
    `https://geo.api.gouv.fr/communes?nom=${cityName}&fields=nom,code&format=json&geometry=centre`
  );
  let cityList = await response.json();
  const targetCity = cityList.find((city) => city.nom === cityName);
  const cityCode = targetCity.code;
  return cityCode;
};

module.exports = { fetchCityCode };
