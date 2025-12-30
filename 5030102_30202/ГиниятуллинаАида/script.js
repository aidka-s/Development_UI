const CELL_LABELS = {
    "Пол": "П",
    "Модуль": "М",
    "Инструмент": "И",
    "Препятствие": "Б",
    "Финиш": "Ф",
    "Контур": "К"
};

const CELL_CLASSES = {
    "Пол": "pol",
    "Модуль": "modul",
    "Инструмент": "instrument",
    "Препятствие": "prepyatstvie",
    "Финиш": "finish",
    "Контур": "kontur"
};

let running = false;
let intervalId = null;

function renderMaze(data) {
    const table = $('#maze');
    table.empty();

    data.forEach((row, y) => {
        const tr = $('<tr>');
        row.forEach((cell, x) => {
            const td = $('<td>')
                .addClass(CELL_CLASSES[cell.type])
                .text(CELL_LABELS[cell.type])
                .data('x', x)
                .data('y', y);

            if (cell.robot) {
                td.addClass('robot');
            }

            tr.append(td);
        });
        table.append(tr);
    });
}

function updateStatus(text) {
    $('#status').text(text);
}

function loadMaze() {
    $.get('/get_maze', function(data) {
        renderMaze(data);
        updateStatus("Готово");
    });
}

$(document).ready(function() {
    loadMaze();

    $('#maze').on('click contextmenu', 'td', function(e) {
        e.preventDefault();
        const x = $(this).data('x');
        const y = $(this).data('y');
        const button = e.type === 'contextmenu' ? 'right' : 'left';

        $.post('/click', JSON.stringify({x: x, y: y, button: button}), function(data) {
            renderMaze(data);
        });
    });

    $('#run').click(function() {
        $.post('/run', function(res) {
            running = res.running;
            if (running) {
                $(this).text('Pause');
                intervalId = setInterval(() => {
                    $.get('/step', function(data) {
                        renderMaze(data);
                    });
                }, 300);
            } else {
                $(this).text('Run');
                clearInterval(intervalId);
            }
        });
    });

    $('#step').click(function() {
        $.get('/step', function(data) {
            renderMaze(data);
        });
    });

    $('#reset').click(function() {
        if (running) {
            $('#run').click();
        }
        $.get('/reset', function(data) {
            renderMaze(data);
            updateStatus("Сброшено");
        });
    });

    $('#demo').click(function() {
        $('#reset').click();
    });
});