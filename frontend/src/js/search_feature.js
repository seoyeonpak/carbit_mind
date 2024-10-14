document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('serch');
    const searchButton = document.querySelector('.serch-button'); // 검색 버튼 선택
    const tableBody = document.querySelector('table tbody'); // 테이블의 body 선택

    let jsonData = [];

    // data2.json 파일에서 데이터 불러오기
    fetch('data2.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data; // 데이터를 전역 변수에 저장
            renderTable(jsonData); // 처음에 모든 데이터를 렌더링
        })
        .catch(error => console.error('Error loading data:', error));

    // 테이블 렌더링 함수
    function renderTable(data) {
        tableBody.innerHTML = ''; // 기존 테이블 내용 지우기

        // 점수를 기준으로 내림차순 정렬
        const sortedData = data.sort((a, b) => b.score - a.score);

        if (sortedData.length === 0) {
            // 결과가 없을 때 메시지 출력
            const noResultRow = document.createElement('tr');
            const noResultCell = document.createElement('td');
            noResultCell.setAttribute('colspan', '4');
            noResultCell.textContent = '결과 없음';
            noResultCell.style.textAlign = 'center'; // 텍스트 가운데 정렬
            noResultRow.appendChild(noResultCell);
            tableBody.appendChild(noResultRow);
        } else {
            // 데이터가 있을 때 테이블을 렌더링
            sortedData.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="rank">${index + 1}</td>
                    <td class="num">${item.car_number}</td>
                    <td class="name">${item.driver_name}</td>
                    <td class="score">${item.score}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // 검색어로 필터링 후 테이블 렌더링
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase(); // 검색어 소문자로 변환 및 트림 처리

        // 차량번호 뒷자리나 이름으로 필터링
        const filteredData = jsonData.filter(item => {
            const carNumberLastPart = item.car_number.split(' ')[1]; // 차량번호 뒷자리
            return item.driver_name.toLowerCase().includes(searchTerm) ||
                   carNumberLastPart.includes(searchTerm);
        });

        // 필터링된 데이터로 테이블 렌더링 (점수 순서대로 정렬)
        renderTable(filteredData);
    }

    // 검색 버튼을 클릭하면 검색 실행
    searchButton.addEventListener('click', performSearch);

    // 검색창에서 엔터키를 누르면 검색 실행
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            performSearch(); // Enter 키를 누르면 검색 실행
        }
    });
});