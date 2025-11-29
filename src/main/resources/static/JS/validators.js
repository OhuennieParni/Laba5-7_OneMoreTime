/**
 * Проверяет корректность электронной почты
 * 
 * @param {type} email - адрес почты
 * @returns {String} - null, если почта корректна; иначе текст ошибки
 */
window.validEmail = function (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? null : "Введите корректную почту";
};

/**
 * Проверяет корректность полного ФИО (3 слова, кириллица).
 * Формат: "Фамилия Имя Отчество".
 * 
 * @param {type} fullName - введенное ФИО
 * @returns {String} - null, если корректно; иначе текст ошибки
 */
window.validFullName = function (fullName) {
    const parts = fullName.trim().replace(/\s+/g, ' ').split(' ');
    if (parts.length !== 3) return "Введите полное ФИО";

    const wordRegex = /^[А-ЯЁа-яё]{2,}(-[А-ЯЁа-яё]{2,})?$/;
    for (let p of parts) {
        if (!wordRegex.test(p)) return "Введите настоящее ФИО";
    }
    return null;
};

/**
 * Проверяет корректность даты рождения.
 * Допустимый возраст: 0–120 лет.
 * 
 * @param {type} birthDate - строка в формате YYYY-MM-DD
 * @returns {String} - null, если дата корректна; иначе текст ошибки
 */
window.validDate = function (birthDate) {
    const today = new Date();
    const date = new Date(birthDate);

    if (isNaN(date.getTime())) return "Введите дату рождения";

    let age = today.getFullYear() - date.getFullYear();
    const md = today.getMonth() - date.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < date.getDate())) age--;

    return age >= 0 && age <= 120 ? null : "Введите корректную дату рождения";
};

/**
 * Проверяет корректность пароля.
 * Требования:
 *  - минимум 8 символов;
 *  - строчная буква;
 *  - заглавная буква;
 *  - цифра.
 *  
 * @param {type} password - пароль
 * @returns {String} - null, если пароль корректен; иначе текст ошибки
 */
window.validPassword = function (password) {
    if (password.length < 8) return "Пароль должен содержать не менее 8 символов";
    if (!/[a-z]/.test(password)) return "Пароль должен содержать строчную букву";
    if (!/[A-Z]/.test(password)) return "Пароль должен содержать заглавную букву";
    if (!/[0-9]/.test(password)) return "Пароль должен содержать цифру";
    return null;
};
