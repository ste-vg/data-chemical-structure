import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';
import { forceSimulation, forceLink, forceManyBody, forceCenter, select } from 'd3';

interface Node
{
    id: string,
    name: string,
    group: number
}

interface Link
{
    source: string,
    target: string,
    value: number
}

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;

    private _width:number = 0;
    private _height:number = 0;
    private padding:number = 10;

    private data:{nodes: Node[], links: Link[]} = {
        nodes: [
            {id: '1', name: 'Behaviour 1', group: 1},
            {id: '2', name: 'Behaviour 2', group: 1},
            {id: '3', name: 'Behaviour 3', group: 1},
            {id: '4', name: 'Behaviour 4', group: 2},
            {id: '5', name: 'Behaviour 5', group: 2},
            {id: '6', name: 'Behaviour 6', group: 2},
            {id: '7', name: 'Behaviour 7', group: 3}
        ],
        links: [
            {source: '1', target: '2', value: 10},
            {source: '1', target: '3', value: 1},
            {source: '1', target: '4', value: 3},
            {source: '1', target: '6', value: 1},
            {source: '2', target: '3', value: 5},
            {source: '2', target: '5', value: 5},
            {source: '3', target: '4', value: 7},
            {source: '3', target: '5', value: 2},
            {source: '3', target: '6', value: 2},
            {source: '4', target: '5', value: 9},
            {source: '4', target: '6', value: 1},
            {source: '5', target: '6', value: 4}
        ]
    }
    
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
            
            const links = this.data.links.map(d => {
                let newD = Object.create(d)
                newD.distance = 240 - (d.value * 20);
                return newD;
            });
            const nodes = this.data.nodes.map(d => Object.create(d));

            const simulation = forceSimulation(nodes)
                .force("link", forceLink(links).distance(d => d.distance))
                .force("charge", forceManyBody())
                .force("center", forceCenter(this._width / 2, this._height / 2));

            const svg = select(this.svg);

            const link = svg.append("g")
                .attr("stroke", "#999")
                //.attr("stroke-opacity", 1)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", d => Math.sqrt(d.value* 10));

            const node = svg.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", 5)
                .attr("fill", 'red')

            node.append("title")
                .text(d => d.id);

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

            //invalidation.then(() => simulation.stop());

            //return svg.node();
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