document.addEventListener('DOMContentLoaded', function () {
    const dateDisplay = document.querySelector('.date-display'); // 선택한 날짜 표시하는 엘리먼트
    const slideButtons = document.querySelectorAll('.slide-button'); // 슬라이드 버튼
    const tabs = document.querySelectorAll('.tab'); // 일간/월간 탭
    let selectedDate = new Date(); // 기본값은 오늘 날짜
    let datePicker; // 달력 인스턴스
    let chartType = 'daily'; // 기본값은 일간 모드

    // 초기에 일간 탭 활성화
    document.querySelector('[data-type="daily"]').classList.add('tab-active');

    // 페이지 로드 시 초기 날짜 설정을 위한 함수
    function setInitialDate() {
        const today = new Date();
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 오늘 날짜 설정
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
                updateSelectedDateDisplay();
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
                    selectedDate.setDate(1); // 월간은 해당 월의 첫날로 설정
                    updateSelectedDateDisplay(); // 선택된 월을 표시
                }
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
            datePicker.setDate(selectedDate, true); // 달력에도 날짜 반영 (동기화)
        });
    });

    // 탭 클릭 이벤트 처리 (일간/월간 전환)
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('tab-active')); // 모든 탭 비활성화
            this.classList.add('tab-active'); // 클릭한 탭 활성화

            chartType = this.dataset.type === 'daily' ? 'daily' : 'monthly'; // 탭에 따라 타입 변경
            setInitialDate(); // 탭 전환 시 오늘 날짜로 초기화
            updateSelectedDateDisplay(); // 날짜 표시 업데이트
            initializeDatePicker(); // 달력 설정 재초기화
        });
    });

    // 초기화 실행
    setInitialDate(); // 초기 페이지 로드 시 오늘 날짜로 설정
});
