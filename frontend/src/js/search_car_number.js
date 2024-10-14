var markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35" fill="none">
        <path fill="#FF0000" d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 12 35 12 35C12 35 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5Z"></path>
    </svg>
`);

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const autoContainer = document.querySelector('.auto');
    const selectedResult = document.getElementById('selected-result');
    const mapContainer = document.getElementById('map');

    let vehicleData = [];

    // 차량 데이터를 불러오기 (data2.json 파일에서)
    fetch('data2.json')
        .then(response => response.json())
        .then(data => {
            vehicleData = data;
        })
        .catch(error => console.error('Error loading vehicle data:', error));

    // 자동완성 기능을 위한 필터링 함수
    function autocompleteSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        autocompleteList.innerHTML = '';

        if (searchTerm.length > 0) {
            const filteredData = vehicleData.filter(item => {
                const carNumberParts = item.car_number.split(' ');
                const carNumberLastPart = carNumberParts[1] || '';
                return carNumberLastPart.startsWith(searchTerm);
            });

            if (filteredData.length > 0) {
                autoContainer.style.display = 'block';
            } else {
                autoContainer.style.display = 'none';
            }

            filteredData.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.car_number}`;
                listItem.classList.add('autocomplete-item');
                listItem.addEventListener('click', function () {
                    selectVehicle(item);
                });
                autocompleteList.appendChild(listItem);
            });
        } else {
            autoContainer.style.display = 'none';
        }
    }

    // 차량 선택 시 결과 표시 함수
    function selectVehicle(vehicle) {
    selectedResult.innerHTML = ''; // 기존 선택 결과 지우기

    // 운행 상태 및 출발지, 도착지 출력
    let resultHTML = `
        <div class="text">
            <p>상태</p>
            <p class="${vehicle.status === '운행 중' ? 'running' : 'not-running'}">${vehicle.status}</p>
        </div>
        <div class="text">
            <p>출발</p>
            <p>${vehicle.origin ? vehicle.origin : '-'}</p> <!-- 출발지 정보가 없을 경우 '-' 표시 -->
        </div>
        <div class="text">
            <p>도착</p>
            <p>${vehicle.arrive ? vehicle.arrive : '-'}</p> <!-- 도착지 정보가 없을 경우 '-' 표시 -->
        </div>`;

    // 지도에 현위치 마커만 표시
    displayMap(vehicle.current_lat, vehicle.current_lng);

    selectedResult.innerHTML = resultHTML;
    autoContainer.style.display = 'none';
    searchInput.value = '';
}

    // 지도에 현위치 마커만 표시하는 함수
    function displayMap(currentLat, currentLng) {
        const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(currentLat, currentLng),
            level: 3
        });

        const imageSize = new kakao.maps.Size(24, 35);
        const markerImage = new kakao.maps.MarkerImage(markerImageSrc, imageSize);

        const currentMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(currentLat, currentLng),
            image: markerImage
        });
        currentMarker.setMap(map);
    }

    searchInput.addEventListener('input', autocompleteSearch);

    // 외부 클릭 시 자동완성 창 닫기
    document.addEventListener('click', function (e) {
        if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
            autoContainer.style.display = 'none';
        }
    });
});