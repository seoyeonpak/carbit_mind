// 즐겨찾기 목록을 로컬 스토리지에서 불러오거나, 없으면 빈 배열로 초기화
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// 즐겨찾기 항목을 로컬 스토리지에 저장하는 함수
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// 버튼 클릭 시 즐겨찾기 추가/제거 및 별 모양 토글 함수
function toggleFavorite(button, name, link, icon) {
    // 해당 항목이 즐겨찾기 목록에 있는지 확인
    const index = favorites.findIndex(fav => fav.name === name);

    if (index !== -1) {
        // 목록에 있으면 제거
        favorites.splice(index, 1);
        button.classList.remove('star_selected');
        button.classList.add('star');
        button.innerHTML = '☆';  // 빈 별로 변경
    } else {
        // 목록에 없고, 최대 5개까지 추가 가능
        if (favorites.length < 5) {
            favorites.push({ name, link, icon });
            button.classList.remove('star');
            button.classList.add('star_selected');
            button.innerHTML = '★';  // 채워진 별로 변경
        } else {
            alert('즐겨찾기는 최대 5개까지만 추가할 수 있습니다.');  // 최대 5개일 경우 알림
        }
    }

    // 즐겨찾기 목록 업데이트
    saveFavorites();
}

// 버튼 상태를 초기화하는 함수
function initializeFavorites() {
    const starButtons = document.querySelectorAll('.star, .star_selected');

    starButtons.forEach(button => {
        const itemRow = button.closest('tr');  // 테이블 행
        const name = itemRow.querySelector('a').textContent.trim();  // 항목 이름
        const link = itemRow.querySelector('a').getAttribute('href');  // 링크
        const icon = itemRow.querySelector('img').getAttribute('src');  // 아이콘

        // 버튼 상태 초기화 (로컬 스토리지에 있는지 확인)
        if (favorites.some(fav => fav.name === name)) {
            button.classList.add('star_selected');
            button.classList.remove('star');
            button.innerHTML = '★';  // 즐겨찾기 목록에 있으면 채워진 별로 표시
        } else {
            button.classList.add('star');
            button.classList.remove('star_selected');
            button.innerHTML = '☆';  // 즐겨찾기 목록에 없으면 빈 별로 표시
        }

        // 클릭 이벤트 설정
        button.addEventListener('click', () => toggleFavorite(button, name, link, icon));
    });
}

// DOM이 로드된 후 즐겨찾기 목록과 버튼 상태 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeFavorites();
});
