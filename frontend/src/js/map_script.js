document.addEventListener('DOMContentLoaded', function () {
    // 지도 생성
    var mapContainer = document.getElementById('map'); // 지도를 표시할 div
    var mapOption = {
        center: new kakao.maps.LatLng(35.888105, 128.611479), // 경북대학교 근처 좌표
        level: 3 // 지도의 확대 레벨
    };
    var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성

    // 마커를 표시하는 함수
    function displayVehicleMarkers(data) {
        data.forEach(function(vehicle) {
            var markerPosition = new kakao.maps.LatLng(vehicle.latitude, vehicle.longitude); // 마커 위치 설정
            
            // 커스텀 마커 이미지 설정
            var markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35" fill="none">
                    <path fill="#FF0000" d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 12 35 12 35C12 35 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5Z"></path>
                </svg>
            `);
            var imageSize = new kakao.maps.Size(24, 35); // 마커 이미지 크기
            var markerImage = new kakao.maps.MarkerImage(markerImageSrc, imageSize);
            
            // 마커 생성
            var marker = new kakao.maps.Marker({
                position: markerPosition,
                image: markerImage, // 커스텀 마커 이미지 설정
                map: map
            });

            // 마커 클릭 시 차량 번호와 운전자 이름을 표시하는 인포윈도우
            var infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding:5px;">운전자: ${vehicle.driver_name}<br>차량번호: ${vehicle.veh_number}</div>`, // 운전자 이름은 임의로 홍길동으로 설정
                removable: true
            });

            kakao.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker); // 클릭 시 인포윈도우를 연다
            });
        });

        // 총 차량 대수 표시
        document.getElementById('total-vehicles').textContent = data.length;
    }

    // JSON 데이터를 불러와서 마커 표시
    fetch('data.json') // JSON 파일 경로를 적절히 설정
        .then(response => response.json())
        .then(data => {
            displayVehicleMarkers(data); // 데이터를 기반으로 마커 표시
        })
        .catch(error => console.error('Error fetching vehicle data:', error));
});
