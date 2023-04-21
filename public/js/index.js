const form = document.getElementById('form');
const name = document.getElementById('name');
const email = document.getElementById('email');
const dob = document.getElementById('dob');
const phone = document.getElementById('phone');
const city = document.getElementById('city');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
})
function checkInputs() {
    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const dobValue = dob.value.trim();
    const phoneValue = phone.value.trim();
    const cityValue = city.value.trim();
    if (nameValue === '') {
        setErrorFor(name, "Username can't be blank");
    }
    else {
        setSuccessFor(name)
    }
}