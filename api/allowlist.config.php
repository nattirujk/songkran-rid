<?php

declare(strict_types=1);

/**
 * Allowlists for signature form validation.
 * This is the single source of truth — update here when src/data.js changes.
 *
 * MANAGERS  → sync with MANAGERS[].name in src/data.js
 * BLESSINGS → sync with BLESSINGS[].text in src/data.js
 */

return [
    'executive_names' => [
        'นายสุริยพล นุชอนงค์',
        'นายเดช เล็กวิชัย',
        'นายทรงพล สวยสม',
        'นายวรพจน์ เพชรนรชาติ',
        'นายฐนันดร์ สุทธิพิศาล',
    ],

    'blessing_texts' => [
        'ขอให้มีสุขภาพแข็งแรง ร่มเย็นเป็นสุข ตลอดปีใหม่ไทย',
        'ดั่งสายน้ำชลประทาน ขอให้ชีวิตไหลเรียบราบรื่น ดั่งสายธาร',
        'ขอให้เจริญรุ่งเรือง มีความสุขสวัสดี ทั้งกายและใจ',
        'ขอให้ท่านประสบความสำเร็จ ในการนำพากรมชลประทานสู่เป้าหมาย',
        'น้ำใสไหลเย็น ขอให้ท่านมีกำลังกาย กำลังใจเต็มเปี่ยมตลอดปี',
        'สงกรานต์ปีนี้ ขอให้ท่านโชคดี มีแต่สิ่งดีๆ รายล้อมตลอดไป',
    ],
];
