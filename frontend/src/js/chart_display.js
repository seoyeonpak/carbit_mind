document.addEventListener('DOMContentLoaded', function () {
    const chartElement = document.getElementById('driveChart');
    const tableElement = document.getElementById('driveTable');
    const chartButton = document.getElementById('chartButton');
    const tableButton = document.getElementById('tableButton');

    const serch = document.getElementById('serch');
    const tabs = document.querySelectorAll('.tab');
    const dateDisplay = document.querySelector('.date-display'); // 선택한 날짜 표시하는 엘리먼트
    const slideButtons = document.querySelectorAll('.slide-button'); // 슬라이드 버튼
    let chartInstance = null;
    let chartType = 'daily'; // 기본값: 일간
    let selectedDate; // 기본값으로 오늘을 로컬 시간으로 설정
    let datePicker; // 달력 인스턴스 저장

    // 초기에 일간 탭 활성화
    document.querySelector('[data-type="daily"]').classList.add('tab-active');
    // 초기에 차트 버튼 활성화
    chartButton.classList.add('active');

    // 페이지 로드 시 초기 날짜 설정을 위한 함수
    function setInitialDate() {
        const today = new Date();
        const timezoneOffset = today.getTimezoneOffset() * 60000;
        selectedDate = new Date(today.getTime() - timezoneOffset); // 로컬 시간대로 설정
    }

    // 초기 페이지 로드 시 날짜 설정
    setInitialDate(); // 오늘 날짜로 초기화
    updateSelectedDateDisplay();
    initializeDatePicker();

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

    // Flatpickr 설정 (날짜 선택) - 한국어로 달력 표시
    function initializeDatePicker() {
        if (datePicker) {
            datePicker.destroy(); // 기존 달력 인스턴스 제거
        }

        const flatpickrOptions = {
            locale: 'ko', // 달력 언어를 한국어로 설정
            defaultDate: selectedDate,
            onChange: function (selectedDates) {
                const timezoneOffset = selectedDates[0].getTimezoneOffset() * 60000;
                selectedDate = new Date(selectedDates[0].getTime() - timezoneOffset); // 로컬 시간으로 변환
                updateSelectedDateDisplay();
                executeSearch();
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
            });
        }
    }

    // 슬라이드 버튼 이벤트 처리
    slideButtons.forEach(button => {
        button.addEventListener('click', function () {
            const direction = this.textContent === '<' ? -1 : 1;

            if (chartType === 'daily') {
                selectedDate.setDate(selectedDate.getDate() + direction); // 하루씩 이동
            } else if (chartType === 'monthly') {
                selectedDate.setMonth(selectedDate.getMonth() + direction); // 한 달씩 이동
                selectedDate.setDate(1); // 월간은 해당 월의 첫날로 설정
            }

            updateSelectedDateDisplay();
            datePicker.setDate(selectedDate); // 달력 버튼에도 날짜 반영
            executeSearch();
        });
    });

    // 차트/표 전환 버튼 이벤트 리스너
    chartButton.addEventListener('click', function () {
        chartElement.style.display = 'block'; // 차트 보이기
        tableElement.style.display = 'none'; // 표 숨기기
        chartButton.classList.add('active');
        tableButton.classList.remove('active');
    });

    tableButton.addEventListener('click', function () {
        chartElement.style.display = 'none'; // 차트 숨기기
        tableElement.style.display = 'table'; // 표 보이기
        tableButton.classList.add('active');
        chartButton.classList.remove('active');
    });

    // 검색 버튼 또는 엔터키로 검색 실행
    function executeSearch() {
        const carNumber = serch.value.trim();
        if (carNumber) {
            fetchData(carNumber);
        } else {
            alert('차량 번호를 입력하세요.');
        }
    }

    // 데이터를 fetch로 불러오는 함수
    function fetchData(carNumber) {
        fetch('data4.json')
            .then(response => response.json())
            .then(data => {
                const vehicle = data.vehicles.find(item => item.car_number === carNumber);
                if (vehicle) {
                    const filteredData = filterDataByType(vehicle.driving_frequency, selectedDate);
                    updateChart(filteredData);  // 차트 갱신
                    updateTable(filteredData);  // 표 갱신
                } else {
                    alert('차량 번호를 찾을 수 없습니다.');
                }
            })
            .catch(error => console.error('데이터 로드 오류:', error));
    }

    // 표를 업데이트하는 함수 (열 크기 유지 및 날짜 형식 변경)
    function updateTable(drivingFrequency) {
        const tableBody = document.querySelector('#driveTable tbody');
        tableBody.innerHTML = '';  // 기존 테이블 내용 초기화

        drivingFrequency.forEach(entry => {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            const countCell = document.createElement('td');

            // 일간 또는 월간에 맞춰 날짜 포맷 설정
            let formattedDate;
            if (chartType === 'daily') {
                const dateObj = new Date(entry.date);
                formattedDate = `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월 ${String(dateObj.getDate()).padStart(2, '0')}일`;
            } else if (chartType === 'monthly') {
                const dateObj = new Date(entry.date);
                formattedDate = `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월`;
            }

            dateCell.textContent = formattedDate;
            countCell.textContent = entry.count;

            row.appendChild(dateCell);
            row.appendChild(countCell);

            tableBody.appendChild(row);
        });
    }

    // 차트를 업데이트하는 함수 (차트 재생성하지 않고 데이터만 갱신)
    function updateChart(drivingFrequency) {
        const labels = drivingFrequency.map(entry => {
            const dateObj = new Date(entry.date);
            if (chartType === 'daily') {
                return `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월 ${String(dateObj.getDate()).padStart(2, '0')}일`;
            } else if (chartType === 'monthly') {
                return `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월`;
            }
        });
        const counts = drivingFrequency.map(entry => entry.count);

        if (chartInstance) {
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = counts;
            chartInstance.update();
        } else {
            const ctx = chartElement.getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '주행 횟수',
                        data: counts,
                        borderColor: '#79a2df',
                        borderWidth: 2,
                        fill: false,
                        pointBackgroundColor: '#79a2df',
                        pointRadius: 5, // 포인트 크기 조정
                        pointHoverRadius: 7, // 포인트 hover 시 크기
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                font: {
                                    size: 15 // x축 폰트 크기
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: {
                                    size: 15 // y축 폰트 크기
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            enabled: true
                        },
                        legend: {
                            display: false // 차트 상단의 레이블을 숨김
                        },
                        datalabels: { // 각 데이터 포인트 위에 값 표시
                            display: true,
                            color: '#000',
                            align: 'top',
                            font: {
                                weight: 'bold',
                                size: 17
                            },
                            formatter: function(value, context) {
                                return value;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels] // ChartDataLabels 플러그인 사용
            });
        }
    }


    // 선택된 날짜를 기준으로 일간/월간 데이터를 필터링하는 함수
    function filterDataByType(drivingFrequency, selectedDate) {
        const selected = new Date(selectedDate);

        if (chartType === 'daily') {
            const startDate = new Date(selected);
            startDate.setDate(startDate.getDate() - 6); // 선택된 날짜 포함 최근 7일

            const filtered = [];
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const formattedDate = currentDate.toISOString().split('T')[0];

                const dayData = drivingFrequency.find(entry => entry.date === formattedDate);
                filtered.push({
                    date: formattedDate,
                    count: dayData ? dayData.count : 0 // 데이터가 없는 경우 0으로 처리
                });
            }

            return filtered;

        } else if (chartType === 'monthly') {
            const months = [];
            const currentMonth = new Date(selectedDate);
            currentMonth.setDate(1); // 해당 월의 첫날로 설정

            for (let i = 0; i < 7; i++) {
                const yearMonth = `${currentMonth.getFullYear()}.${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

                const monthlyData = drivingFrequency.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getFullYear() === currentMonth.getFullYear() && entryDate.getMonth() === currentMonth.getMonth();
                });

                const totalCount = monthlyData.reduce((acc, entry) => acc + entry.count, 0);
                months.unshift({ date: yearMonth, count: totalCount });

                currentMonth.setMonth(currentMonth.getMonth() - 1); // 한 달 전으로 이동
            }

            return months;
        }
    }

    // 일간/월간 탭 클릭 이벤트
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('tab-active'));
            this.classList.add('tab-active');
            chartType = this.dataset.type; // 선택된 옵션에 따라 차트 타입 변경

            setInitialDate(); // 탭 전환 시 오늘 날짜로 초기화
            updateSelectedDateDisplay(); // 날짜 표시 업데이트
            initializeDatePicker(); // 달력 설정 재초기화
            executeSearch(); // 차트 갱신
        });
    });

    // 검색 버튼 클릭 및 엔터키 이벤트 리스너
    document.querySelector('.serch-button').addEventListener('click', executeSearch);
    serch.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            executeSearch();
        }
    });
});
