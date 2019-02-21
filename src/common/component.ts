export class Component
{
    container:HTMLElement;

    constructor(name:string, html:string, container:Element, onReady:Function)
    {
        this.container = document.createElement(name);
        this.container.setAttribute('class', container.getAttribute('class') || '');
        this.container.innerHTML = html;
        let parent = container.parentNode;
        if(parent) 
        {
            parent.insertBefore(this.container, container);
            container.remove();
            setTimeout(() => onReady());
        }
        else console.error('error injecting element')
    }
}