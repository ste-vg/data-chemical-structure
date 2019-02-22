import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';
import { forceSimulation, forceLink, forceManyBody, forceCenter, select, forceCollide, range, max } from 'd3';

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
    private hexSize:number = 30;

    private data:{nodes: Node[], links: Link[]} = {
        nodes: [
            {id: '1', name: 'Lorem ipsum', group: 1},
            {id: '2', name: 'Dolor sit amet', group: 1},
            {id: '3', name: 'Consectetur', group: 1},
            {id: '4', name: 'Adipisicing elit', group: 2},
            {id: '5', name: 'Repellat', group: 2},
            {id: '6', name: 'Eos aperiam nemo', group: 2},
            {id: '7', name: 'Hulla quam', group: 3},
            {id: '8', name: 'Harum eveniet', group: 3},
            {id: '9', name: 'Voluptatum', group: 3},
            {id: '10', name: 'Atque provident', group: 3}
        ],
        links: [
            {source: '1', target: '2', value: 10},
            {source: '1', target: '3', value: 1},
            {source: '1', target: '4', value: 3},
            {source: '1', target: '6', value: 11},
            {source: '2', target: '3', value: 5},
            {source: '2', target: '5', value: 5},
            {source: '3', target: '4', value: 7},
            {source: '3', target: '5', value: 2},
            {source: '3', target: '6', value: 2},
            {source: '4', target: '5', value: 9},
            {source: '4', target: '6', value: 1},
            {source: '5', target: '6', value: 4},
            {source: '6', target: '7', value: 4},
            {source: '6', target: '8', value: 10},
            {source: '6', target: '9', value: 3},
            {source: '7', target: '8', value: 4}
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
            const maxValue = max(this.data.links, d => d.value)
            const links = this.data.links.map(d => {
                let newD = Object.create(d)
                let gap = this.hexSize;
                newD.distance = gap + ((maxValue * gap) - (d.value) * gap);
                newD.value = d.value < (maxValue *.4) ? 0 : d.value;
                return newD;
            });
            const nodes = this.data.nodes.map(d => Object.create(d));

            const simulation = forceSimulation(nodes)
                .force("link", forceLink(links).distance(d => d.distance))
                .force("charge", forceManyBody().strength(-75))
                .force("center", forceCenter(this._width / 2, this._height / 2))
                .force('collision', forceCollide().radius(this.hexSize))

            const svg = select(this.svg);

            const link = svg.append("g")
                .attr("stroke", "#999")
                //.attr("stroke-opacity", 1)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", d => {
                    let w = d.value / 2;
                    return w > 10 ? 10 : w;
                }) ;

            const nodeOutline = svg.append("g")
                .selectAll("path")
                .data(nodes)
                .join("path")
                .attr("class", 'hex outline')
            
            const nodeInside = svg.append("g")
                .selectAll("path")
                .data(nodes)
                .join("path")
                .attr("class", 'hex inside')
            
            const nodeCenter = svg.append("g")
                .selectAll("path")
                .data(nodes)
                .join("path")
                .attr("class", 'hex center')
            
            const nodeLabel = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .text(this.getLabel)
                .attr("class", 'label')
                .attr("alignment-baseline", 'middle')

            // node.append("title")
            //     .text(d => d.id);

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                nodeOutline.attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize))
                nodeInside.attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize * .9))
                nodeCenter.attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize * .85))
                
                nodeLabel
                    .attr("x", d => d.x)
                    .attr("y", d => d.y)
            });

            //invalidation.then(() => simulation.stop());

            //return svg.node();
        }
    }

    private getLabel(node:Node):string
    {
        let words = node.name.split(' ');
        if(words.length > 1) return words[0].charAt(0) + words[1].charAt(0).toLowerCase();
        return node.name.slice(0, 2);
    }

    private getPolygonPath(x:number, y:number, radius:number, sides:number = 6, startAngle:number = 0) 
    {
        let d = ''

        range(sides).map(side => 
        {
            const angle = startAngle + 2 * Math.PI * side / sides
            return [x + (radius * Math.cos(angle)), y + (radius * Math.sin(angle))]
        })
        .forEach(pt => 
        {
            d += (d.length ? 'L' : 'M') + pt.join(',')
        })

        return d + 'Z'
    }

    onResize()
	{
        if(this._container)
        {
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;

            this.hexSize = this.width  * .06;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };

}