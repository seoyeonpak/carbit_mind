// 즐겨찾기 목록을 로컬 스토리지에서 불러오거나, 없으면 빈 배열로 초기화
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// 메뉴 항목의 고정된 순서를 정의 (원본 이름과 표시할 이름 모두 포함)
const menuOrder = [
    { originalName: "실시간 모든 차량 위치 확인", displayName: "실시간 모든 차량", order: 1 },
    { originalName: "운행 순위 확인", displayName: "운행 순위 확인", order: 2 },
    { originalName: "현재 위치 확인", displayName: "현재 위치 확인", order: 3 },
    { originalName: "차량별 주행 횟수", displayName: "차량별 주행 횟수", order: 4 },
    { originalName: "차량별 운전 경로 확인", displayName: "차량별 운전 경로 확인", order: 5 },
    { originalName: "차량별 운전 스타일 확인", displayName: "차량별 운전 스타일 확인", order: 6 },
    { originalName: "차량별 주행 기록 확인", displayName: "차량별 주행 기록 확인", order: 7 }
];

// 즐겨찾기 목록을 고정된 순서로 정렬하는 함수
function sortFavorites(favorites) {
    return favorites.sort((a, b) => {
        const aOrder = menuOrder.find(item => item.originalName === a.name)?.order || 100;
        const bOrder = menuOrder.find(item => item.originalName === b.name)?.order || 100;
        return aOrder - bOrder;
    });
}

// 즐겨찾기 목록을 "자주 찾는 메뉴" 섹션에 렌더링하는 함수
function renderFavorites() {
    const favoritesContainer = document.querySelector('.menu');
    favoritesContainer.innerHTML = '';  // 기존 내용 초기화

    // 즐겨찾기 목록이 비어 있으면 기본 메시지 표시
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>즐겨찾기한 메뉴가 없습니다.</p>';
        return;
    }

    // 즐겨찾기 목록을 고정된 순서대로 정렬
    const sortedFavorites = sortFavorites(favorites);

    // 정렬된 즐겨찾기 목록을 순회하며 동적으로 메뉴 항목 생성
    sortedFavorites.forEach(fav => {
        // 표시할 이름을 menuOrder에서 가져옴
        const menuItem = menuOrder.find(item => item.originalName === fav.name);
        const displayName = menuItem ? menuItem.displayName : fav.name;

        const favItem = document.createElement('div');
        favItem.classList.add('menu-item');
        favItem.innerHTML = `
            <a href="${fav.link}">
                <img src="${fav.icon}" alt="${displayName}">
                <p>${displayName}</p>
            </a>
        `;
        favoritesContainer.appendChild(favItem);
    });
}

// DOM이 로드된 후 즐겨찾기 목록을 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();  // 페이지 로드 시 즐겨찾기 목록 표시
});