import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;

    private _width:number = 0;
    private _height:number = 0;
    private padding:number = 10;
    
    constructor(container:Element)
    {
        super('app', HTML, container, () => this.onInit());

        // create elements

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }

    private onInit()
    {
        this._container = document.getElementById('root');

        if(this._container)
        {
            this._container.appendChild(this.svg);
            
            window.addEventListener('resize', () => this.onResize())
            this.onResize();            
        }
    }

    private draw()
    {
        
    }

    tick()
    {
        this.draw();
        requestAnimationFrame(() => this.tick());
    }

    onResize()
	{
        if(this._container)
        {
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };

}