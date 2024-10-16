document.addEventListener('DOMContentLoaded', function () {
    const dateDisplay = document.querySelector('.date-display'); // 선택한 날짜 표시하는 엘리먼트
    const slideButtons = document.querySelectorAll('.slide-button'); // 슬라이드 버튼
    const tabs = document.querySelectorAll('.tab'); // 일간/월간 탭
    const searchInput = document.getElementById('serch');
    const searchButton = document.querySelector('.serch-button'); // 검색 버튼 선택
    const tableBody = document.querySelector('table tbody'); // 테이블의 body 선택
    let jsonData = []; // 데이터 저장할 배열
    let selectedDate = new Date(); // 기본값은 오늘 날짜
    let datePicker; // 달력 인스턴스
    let chartType = 'daily'; // 기본값은 일간 모드

    // 초기에 일간 탭 활성화
    document.querySelector('[data-type="daily"]').classList.add('tab-active');

    // data3.json 파일에서 데이터 불러오기
    fetch('data3.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data; // 데이터를 전역 변수에 저장
            performSearch(); // 초기 데이터를 렌더링
        })
        .catch(error => console.error('Error loading data:', error));

    // 선택된 날짜를 표시하는 함수
    function updateSelectedDateDisplay() {
        if (chartType === 'daily') {
            const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\./g, '').replace(/\s/g, '. ').trim() + ".";
            dateDisplay.textContent = formattedDate;
        } else if (chartType === 'monthly') {
            const yearMonth = selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit'
            }).replace(/\./g, '').replace(/\s/g, '. ').trim() + ".";
            dateDisplay.textContent = yearMonth;
        }
    }

    // Flatpickr 설정 (달력 선택) - 한국어로 달력 표시
    function initializeDatePicker() {
        if (datePicker) {
            datePicker.destroy(); // 기존 달력 인스턴스 제거
        }

        const flatpickrOptions = {
            locale: 'ko', // 달력 언어를 한국어로 설정
            defaultDate: selectedDate,
            onChange: function (selectedDates) {
                selectedDate = new Date(selectedDates[0]); // 선택된 날짜로 업데이트
                selectedDate.setHours(12, 0, 0, 0); // 타임존 문제 해결
                updateSelectedDateDisplay();
                performSearch(); // 날짜가 바뀔 때마다 검색
            }
        };

        if (chartType === 'daily') {
            datePicker = flatpickr(".calendar-button", {
                ...flatpickrOptions,
                dateFormat: "Y. m. d",
            });
        } else if (chartType === 'monthly') {
            datePicker = flatpickr(".calendar-button", {
                ...flatpickrOptions,
                plugins: [new monthSelectPlugin()],
                dateFormat: "Y. m",
                onChange: function (selectedDates) {
                    selectedDate = new Date(selectedDates[0]);
                    selectedDate.setDate(1); // 월간 모드에서 해당 월의 첫날로 설정
                    selectedDate.setHours(12, 0, 0, 0); // 타임존 문제 해결
                    updateSelectedDateDisplay();
                    performSearch(); // 월이 바뀔 때마다 검색
                }
            });
        }
    }

    // 날짜와 검색어로 데이터를 필터링 및 월 평균 계산
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase(); // 검색어
        const formattedDate = selectedDate.toISOString().split('T')[0]; // 선택된 날짜 (YYYY-MM-DD)

        let filteredData;

        if (chartType === 'daily') {
            // 일간 모드: 차량번호 또는 운전자 이름에 검색어가 포함된 데이터 필터링
            filteredData = jsonData.filter(item => {
                const carNumberLastPart = item.car_number.split(' ')[1]; // 차량번호 뒷자리
                const matchesSearchTerm = item.driver_name.toLowerCase().includes(searchTerm) ||
                                          carNumberLastPart.includes(searchTerm);
                const matchesDate = item.date === formattedDate; // 선택된 날짜와 일치하는지 확인
                return matchesSearchTerm && matchesDate;
            });
        } else if (chartType === 'monthly') {
            // 월간 모드: 월별 평균을 계산
            const selectedYearMonth = formattedDate.slice(0, 7); // 'YYYY-MM' 형식으로 자름
            const monthlyData = jsonData.filter(item => item.date.startsWith(selectedYearMonth));

            // 각 차량번호의 월 평균 점수를 계산
            const carNumberData = {};
            monthlyData.forEach(item => {
                if (!carNumberData[item.car_number]) {
                    carNumberData[item.car_number] = { scores: [], driver_name: item.driver_name };
                }
                carNumberData[item.car_number].scores.push(item.score);
            });

            // 평균 점수를 계산 후 검색어 필터 적용
            filteredData = Object.keys(carNumberData).map(carNumber => {
                const totalScore = carNumberData[carNumber].scores.reduce((acc, score) => acc + score, 0);
                const averageScore = totalScore / carNumberData[carNumber].scores.length;
                return {
                    car_number: carNumber,
                    driver_name: carNumberData[carNumber].driver_name,
                    score: Math.round(averageScore) // 소수점 반올림
                };
            }).filter(item => {
                // 검색어에 맞는 데이터만 필터링
                const carNumberLastPart = item.car_number.split(' ')[1]; // 차량번호 뒷자리
                const matchesSearchTerm = item.driver_name.toLowerCase().includes(searchTerm) ||
                                          carNumberLastPart.includes(searchTerm);
                return matchesSearchTerm;
            });
        }

        renderTable(filteredData); // 필터링된 데이터를 테이블에 렌더링
    }

    // 테이블 렌더링 함수
    function renderTable(data) {
        tableBody.innerHTML = ''; // 기존 테이블 내용 지우기

        if (data.length === 0) {
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
            data.forEach((item, index) => {
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

    // 슬라이드 버튼 이벤트 처리 (버튼 동기화)
    slideButtons.forEach(button => {
        button.addEventListener('click', function () {
            const direction = this.textContent === '<' ? -1 : 1;

            if (chartType === 'daily') {
                selectedDate.setDate(selectedDate.getDate() + direction); // 하루씩 이동
            } else if (chartType === 'monthly') {
                selectedDate.setMonth(selectedDate.getMonth() + direction); // 한 달씩 이동
                selectedDate.setDate(1); // 월간 모드에서는 해당 월의 첫날로 설정
            }

            selectedDate.setHours(12, 0, 0, 0); // 타임존 문제 해결
            updateSelectedDateDisplay();
            datePicker.setDate(selectedDate, true); // 달력에도 날짜 반영 (동기화)
            performSearch(); // 날짜가 변경되면 필터링 실행
        });
    });

    // 탭 클릭 이벤트 처리 (일간/월간 전환 동기화)
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('tab-active')); // 모든 탭 비활성화
            this.classList.add('tab-active'); // 클릭한 탭 활성화

            chartType = this.dataset.type === 'daily' ? 'daily' : 'monthly'; // 탭에 따라 모드 변경

            if (chartType === 'monthly') {
                // 일간에서 월간으로 전환 시, 해당 월의 첫날로 이동
                selectedDate.setDate(1);
            }

            selectedDate.setHours(12, 0, 0, 0); // 타임존 문제 해결
            updateSelectedDateDisplay(); // 날짜 표시 업데이트
            initializeDatePicker(); // 달력 설정 재초기화
            performSearch(); // 탭 전환 시 필터링 실행
        });
    });

    // 검색 버튼을 클릭하면 검색 실행
    searchButton.addEventListener('click', performSearch);

    // 검색창에서 엔터키를 누르면 검색 실행
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch(); // Enter 키를 누르면 검색 실행
        }
    });

    // 초기화 실행
    function setInitialDate() {
        const today = new Date();
        selectedDate = today;
        selectedDate.setHours(12, 0, 0, 0); // 타임존 문제 해결
        updateSelectedDateDisplay();
        initializeDatePicker();
    }

    setInitialDate(); // 초기 페이지 로드 시 오늘 날짜로 설정
});