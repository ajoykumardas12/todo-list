exports.getDate = function(){
    const date = new Date();

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }

    return date.toLocaleString('en-US', options);
}

exports.getWeekday = function(){
    const date = new Date();

    const options = {
        weekday: 'long',
    }

    return date.toLocaleString('en-US', options);
}