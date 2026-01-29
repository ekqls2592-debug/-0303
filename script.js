// 시간표 데이터
const scheduleData = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: []
};

// 시간 관련 상수
const START_HOUR = 9;
const END_HOUR = 17;
const MINUTES_PER_SLOT = 30;

// 시간 배열 생성 (9:00 ~ 17:00, 30분단위)
function getTimeSlots() {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:30`);
    }
    return slots;
}

// 시간표 초기화
function initializeSchedule() {
    const scheduleBody = document.getElementById('schedule-body');
    const timeSlots = getTimeSlots();

    timeSlots.forEach(time => {
        const row = document.createElement('div');
        row.className = 'table-row';

        // 시간 라벨
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = time;
        row.appendChild(timeLabel);

        // 각 요일별 슬롯
        const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
        days.forEach(day => {
            const slot = document.createElement('div');
            slot.className = 'day-slot';
            slot.setAttribute('data-day', day);
            slot.setAttribute('data-time', time);
            row.appendChild(slot);
        });

        scheduleBody.appendChild(row);
    });

    // 시작 시간 드롭다운 채우기
    const startTimeSelect = document.getElementById('lecture-start');
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        startTimeSelect.appendChild(option);
    });
}

// 시간을 분단위로 변환
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// 분을 시간으로 변환
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
}

// 시간표에 강의 표시
function displayLecturesOnSchedule() {
    // 기존 강의 블록 제거
    document.querySelectorAll('.lecture-block').forEach(block => block.remove());

    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    days.forEach((day, dayIndex) => {
        scheduleData[day].forEach(lecture => {
            const startMinutes = timeToMinutes(lecture.start);
            const durationMinutes = parseInt(lecture.duration);
            const endMinutes = startMinutes + durationMinutes;

            // 해당 시간 슬롯 찾기
            const slots = document.querySelectorAll(`[data-day="${day}"]`);
            const timeSlots = getTimeSlots();

            slots.forEach((slot, slotIndex) => {
                const slotStartMinutes = timeToMinutes(timeSlots[slotIndex]);
                const slotEndMinutes = slotStartMinutes + MINUTES_PER_SLOT;

                // 강의가 이 슬롯과 겹치는지 확인
                if (startMinutes < slotEndMinutes && endMinutes > slotStartMinutes) {
                    const block = document.createElement('div');
                    block.className = 'lecture-block';
                    block.innerHTML = `<strong>${lecture.name}</strong><br>${lecture.room}`;
                    block.setAttribute('data-lecture-id', lecture.id);
                    block.addEventListener('click', () => deleteLecture(lecture.id));
                    block.title = '클릭하면 삭제됩니다';
                    slot.appendChild(block);
                }
            });
        });
    });
}

// 강의 추가
function addLecture(e) {
    e.preventDefault();

    const name = document.getElementById('lecture-name').value;
    const room = document.getElementById('lecture-room').value;
    const day = document.getElementById('lecture-day').value;
    const start = document.getElementById('lecture-start').value;
    const duration = document.getElementById('lecture-duration').value;

    if (!name || !room || !day || !start || !duration) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const lecture = {
        id: Date.now(),
        name: name,
        room: room,
        start: start,
        duration: duration
    };

    scheduleData[day].push(lecture);

    // UI 업데이트
    displayLecturesOnSchedule();
    displayLectureList();

    // 폼 초기화
    document.getElementById('lecture-form').reset();
}

// 강의 목록 표시
function displayLectureList() {
    const lecturesList = document.getElementById('lectures');
    lecturesList.innerHTML = '';

    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const dayNames = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금' };

    days.forEach(day => {
        scheduleData[day].forEach(lecture => {
            const li = document.createElement('li');
            li.className = 'lecture-item';

            const endMinutes = timeToMinutes(lecture.start) + parseInt(lecture.duration);
            const endTime = minutesToTime(endMinutes);

            li.innerHTML = `
                <div class="lecture-info">
                    <div class="lecture-title">${lecture.name}</div>
                    <div class="lecture-details">
                        ${dayNames[day]}요일 ${lecture.start} ~ ${endTime} | ${lecture.room}
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteLecture(${lecture.id})">삭제</button>
            `;

            lecturesList.appendChild(li);
        });
    });

    // 강의가 없으면 메시지 표시
    if (lecturesList.children.length === 0) {
        lecturesList.innerHTML = '<li style="color: #aaa; text-align: center;">강의를 추가해주세요</li>';
    }
}

// 강의 삭제
function deleteLecture(id) {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    days.forEach(day => {
        scheduleData[day] = scheduleData[day].filter(lecture => lecture.id !== id);
    });

    displayLecturesOnSchedule();
    displayLectureList();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeSchedule();
    displayLectureList();

    // 폼 제출 이벤트
    document.getElementById('lecture-form').addEventListener('submit', addLecture);
});
