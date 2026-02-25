function forEach(array, handler) {
    for (let i = 0; i < array.length; i++) {
        handler(array[i], i)
    }

    function  modify(className, modifier){
        let elements = document.getElementsByClassName(className)
        forEach(elements, modifier)
    }

    function setDisplay(className, show){
        modify(className, function(element){
            element.style.display = show ? "block" : "none"
        })
    }
}

function setText(className, text){
    modify(className, function(element){
        element.textContent = text
    })
}
function clearSelect(select){
    while(select.options.length > 0){
        select.remove(0)
    }
}

function addOption(select, key, value){
    let option = document.createElement("option")
    option.value = key
    option.textContent = value
    select.appendChild(option)
}

function appendParagraph(text, container){
    let p = document.createElement("p")
    p.appendChild(document.createTextNode(text))
    container.appendChild(p)
}