function checkInput(input) {
    if (input.value.length > 0) {
        input.className = 'active';
    } else {
        input.className = '';
    }
}