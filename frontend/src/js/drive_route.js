document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('serch');
    const tableBody = document.querySelector('tbody');
    const popup = document.getElementById('map-popup');
    const overlay = document.getElementById('overlay');
    const closePopupBtn = document.getElementById('close-popup');
    let vehicleData = [];
    let map = null; // 카카오맵 객체
    let originMarker = null; // 출발지 마커
    let destinationMarker = null; // 도착지 마커
    let polyline = null; // 경로

    // 차량 데이터를 불러오기 (json 파일 경로 설정)
    fetch('data5.json')
        .then(response => response.json())
        .then(data => {
            vehicleData = data.vehicles;
            displayVehicleData(vehicleData); // 초기 테이블 데이터 표시
        })
        .catch(error => console.error('Error loading vehicle data:', error));

    // 테이블에 데이터를 표시하는 함수
    function displayVehicleData(data) {
        tableBody.innerHTML = ''; // 기존 데이터를 초기화
        data.forEach((vehicle, index) => {
            const row = document.createElement('tr');

            // 테이블 데이터 생성
            const noCell = document.createElement('td');
            noCell.textContent = index + 1;

            const originCell = document.createElement('td');
            originCell.textContent = vehicle.origin;

            const destinationCell = document.createElement('td');
            destinationCell.textContent = vehicle.destination;

            const mapCell = document.createElement('td');
            const mapLink = document.createElement('a');
            mapLink.href = 'javascript:void(0);';
            mapLink.textContent = '지도';
            mapLink.addEventListener('click', function () {
                showMapPopup(vehicle); // 차량 경로 팝업 띄우기
            });
            mapCell.appendChild(mapLink);

            // 행에 데이터 추가
            row.appendChild(noCell);
            row.appendChild(originCell);
            row.appendChild(destinationCell);
            row.appendChild(mapCell);

            tableBody.appendChild(row);
        });
    }

    // 팝업 창 열고 카카오맵을 표시하는 함수
    function showMapPopup(vehicle) {
        popup.classList.add('show');
        overlay.classList.add('show');

        // 카카오 지도 생성
        if (!map) {
            map = new kakao.maps.Map(document.getElementById('map'), {
                center: new kakao.maps.LatLng(vehicle.origin_lat, vehicle.origin_lng),
                level: 5
            });
        } else {
            map.setCenter(new kakao.maps.LatLng(vehicle.origin_lat, vehicle.origin_lng));
        }

        // 이전 마커 및 경로 삭제
        if (originMarker) {
            originMarker.setMap(null);
        }
        if (destinationMarker) {
            destinationMarker.setMap(null);
        }
        if (polyline) {
            polyline.setMap(null);
        }

        // 출발지 마커 추가
        originMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(vehicle.origin_lat, vehicle.origin_lng),
            map: map,
            title: '출발지'
        });

        // 도착지 마커 추가
        destinationMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(vehicle.destination_lat, vehicle.destination_lng),
            map: map,
            title: '도착지'
        });

        // 경로 그리기
        const pathCoordinates = vehicle.path.map(point => new kakao.maps.LatLng(point.lat, point.lng));
        polyline = new kakao.maps.Polyline({
            path: pathCoordinates,
            strokeWeight: 5,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });

        polyline.setMap(map);
    }

    // 팝업 창 닫기 처리
    closePopupBtn.addEventListener('click', function () {
        popup.classList.remove('show');
        overlay.classList.remove('show');

        // 팝업이 닫힐 때 마커 및 경로 삭제
        if (originMarker) {
            originMarker.setMap(null);
        }
        if (destinationMarker) {
            destinationMarker.setMap(null);
        }
        if (polyline) {
            polyline.setMap(null);
        }
    });

    // 오버레이 클릭 시 팝업 창 닫기
    overlay.addEventListener('click', function () {
        popup.classList.remove('show');
        overlay.classList.remove('show');

        // 오버레이 클릭 시 마커 및 경로 삭제
        if (originMarker) {
            originMarker.setMap(null);
        }
        if (destinationMarker) {
            destinationMarker.setMap(null);
        }
        if (polyline) {
            polyline.setMap(null);
        }
    });

    // 검색 이벤트 처리
    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            const filteredData = vehicleData.filter(vehicle => vehicle.number.includes(searchTerm));
            displayVehicleData(filteredData); // 필터링된 데이터로 테이블 갱신
        } else {
            displayVehicleData(vehicleData); // 검색어가 없을 경우 전체 데이터 표시
        }
    });
});
