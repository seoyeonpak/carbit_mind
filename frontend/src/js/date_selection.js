document.addEventListener('DOMContentLoaded', function() {
    // 달력 버튼과 날짜 텍스트 선택
    const calendarButton = document.querySelector(".calendar-button");
    const dateDisplay = document.querySelector(".date-display");
    const dailyTab = document.querySelector('.tab:nth-child(1)');
    const monthlyTab = document.querySelector('.tab:nth-child(2)');

    // 오늘 날짜를 기본값으로 설정
    const today = new Date();
    const formattedToday = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '').trim().replace(/\s/g, '. ');

    // 오늘의 월 (연.월) 포맷으로 설정
    const formattedMonth = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
    }).replace(/\./g, '').trim().replace(/\s/g, '. ');

    // 페이지 로드 시 오늘 날짜 표시 (일간 모드 기본)
    dateDisplay.textContent = formattedToday;

    // 일간 모드를 기본으로 설정하고, 탭 활성화
    dailyTab.classList.add('tab-active');
    
    // Flatpickr 달력 인스턴스 생성 (일간 모드 기본 설정)
    let datePicker = flatpickr(calendarButton, {
        dateFormat: "Y. m. d", // 일간 달력의 날짜 포맷
        defaultDate: today, // 기본값으로 오늘 날짜 설정
        onChange: function(selectedDates, dateStr, instance) {
            dateDisplay.textContent = dateStr; // 선택된 날짜로 텍스트 업데이트
        }
    });

    // 일간 탭을 클릭하면 일간 모드로 달력 설정
    dailyTab.addEventListener('click', function() {
        dailyTab.classList.add('tab-active');
        monthlyTab.classList.remove('tab-active');
        datePicker.destroy(); // 기존 인스턴스를 제거

        // 일간 모드로 다시 생성
        datePicker = flatpickr(calendarButton, {
            dateFormat: "Y. m. d", // 일간 날짜 포맷
            defaultDate: today, // 오늘 날짜를 기본값으로
            onChange: function(selectedDates, dateStr, instance) {
                dateDisplay.textContent = dateStr; // 선택된 날짜로 텍스트 업데이트
            }
        });

        // 일간 모드로 변경 시 오늘 날짜 표시
        dateDisplay.textContent = formattedToday;
    });

    // 월간 탭을 클릭하면 월간 모드로 달력 설정
    monthlyTab.addEventListener('click', function() {
        monthlyTab.classList.add('tab-active');
        dailyTab.classList.remove('tab-active');
        datePicker.destroy(); // 기존 인스턴스를 제거

        // 월간 모드로 다시 생성 (monthSelect 플러그인 사용)
        datePicker = flatpickr(calendarButton, {
            dateFormat: "Y. m", // 연월 포맷
            defaultDate: today, // 오늘의 연월을 기본값으로
            plugins: [
                new monthSelectPlugin({
                    shorthand: true, // 짧은 월 이름 사용 (e.g., Jan, Feb)
                    dateFormat: "Y. m", // 연월 포맷
                    altFormat: "F Y", // 보기 편한 포맷 (January 2024)
                })
            ],
            onChange: function(selectedDates, dateStr, instance) {
                dateDisplay.textContent = dateStr; // 선택된 연월로 텍스트 업데이트
            }
        });

        // 월간 모드로 변경 시 현재 월 표시
        dateDisplay.textContent = formattedMonth;
    });

    // 달력 버튼을 눌렀을 때 달력을 엽니다
    calendarButton.addEventListener("click", function() {
        datePicker.open(); // 달력 열기
    });
});