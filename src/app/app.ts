import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';
import { forceSimulation, forceLink, forceManyBody, forceCenter, select, forceCollide, range, max, Simulation, event, drag } from 'd3';

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
    value: number,
    distance?: number
}

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;

    private _width:number = 0;
    private _height:number = 0;
    private padding:number = 10;
    private hexSize:number = 50;
    private sim:any;
    private animationSpeed:number = 500;
    private opacity:number = 0;

    private linkSelector:any;

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
            {source: '1', target: '2', value: 12},
            {source: '1', target: '2', value: 12},
            {source: '1', target: '3', value: 1},
            {source: '1', target: '4', value: 3},
            {source: '1', target: '6', value: 6},
            {source: '2', target: '3', value: 5},
            {source: '2', target: '5', value: 5},
            {source: '3', target: '4', value: 7},
            {source: '3', target: '5', value: 2},
            {source: '3', target: '6', value: 2},
            {source: '4', target: '5', value: 4},
            {source: '4', target: '6', value: 10},
            {source: '5', target: '6', value: 1},
            {source: '6', target: '7', value: 1},
            {source: '6', target: '8', value: 8},
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

    private getLinks(links:Link[]):any[]
    {
        const maxValue = max(this.data.links, d => d.value);
        

        return this.data.links.map(d => {
            let newD = Object.create(d);
            let gap = this.hexSize * 0.25;
            newD.value = d.value < (maxValue *.5) ? 0 : d.value;
            newD.distance = gap + ((maxValue * gap) - (newD.value * gap));
            if(newD.distance > this.sizeBy / 8) newD.distance = this._width / 3
            return newD;
        });
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
            const links = this.getLinks(this.data.links);
            const nodes = this.data.nodes.map(d => Object.create(d));

            this.sim = forceSimulation(nodes)
                .force("link", forceLink(links).distance(d => d.distance))
                .force("charge", forceManyBody().strength(-50))
                .force("center", forceCenter(this._width / 2, this._height / 2))
                .force('collision', forceCollide().radius(this.hexSize * 1.5))

            const svg = select(this.svg);

            this.linkSelector = svg.append("g")
                .attr("stroke", "#999")
                .selectAll("line")
                .data(links)
                .join("line")
                
                .attr("stroke-width", d => {
                    let w = d.value * 0.75;
                    return w > 10 ? 10 : w;
                }) ;

            const linkDoubler = svg.append("g")
                .attr("stroke", "#999")
                .selectAll("line")
                .data(links)
                .join("line")
                .attr('class', 'doubler')
                .attr("stroke-width", d => {
                    if(d.value < maxValue * 0.6) return 0;
                    let w = d.value / 3;
                    
                    return w > 5 ? 5 : w;
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
                .call(() => this.drag(this.sim));
            
            const nodeLabel = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .text(this.getLabel)
                .attr("class", 'label')
                .attr("alignment-baseline", 'middle')

            this.sim.on("tick", () => 
            {      
                nodeOutline.style('opacity', this.opacity).attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize))
                nodeInside.style('opacity', this.opacity).attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize * .9))
                nodeCenter.style('opacity', this.opacity).attr("d", d => this.getPolygonPath(d.x, d.y, this.hexSize * .85))
                
                this.linkSelector
                    .style('opacity', this.opacity)
                    .attr("x1", (d:any) => this.getXY(d.source.x, d.source.y).x)
                    .attr("y1", (d:any) => this.getXY(d.source.x, d.source.y).y)
                    .attr("x2", (d:any) => this.getXY(d.target.x, d.target.y).x)
                    .attr("y2", (d:any) => this.getXY(d.target.x, d.target.y).y);
                
                linkDoubler
                    .style('opacity', this.opacity)
                    .attr("x1", d => this.getXY(d.source.x, d.source.y).x)
                    .attr("y1", d => this.getXY(d.source.x, d.source.y).y)
                    .attr("x2", d => this.getXY(d.target.x, d.target.y).x)
                    .attr("y2", d => this.getXY(d.target.x, d.target.y).y);

                nodeLabel
                    .style('opacity', this.opacity)
                    .attr("x", d => this.getXY(d.x, d.y).x)
                    .attr("y", d => this.getXY(d.x, d.y).y)
                    .style('font-size', `${this.hexSize / 2}px`)
            });

            setTimeout(() => 
            {
                for (var i = 1000; i > 0; --i) this.sim.tick();
                this.opacity = 1;
                
            }, 10);
        }
    }

    private drag = (simulation:any) => 
    {
  
        function dragstarted(d:any) 
        {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
        
        function dragged(d:any) 
        {
          d.fx = event.x;
          d.fy = event.y;
        }
        
        function dragended(d:any) 
        {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
        
        return drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    private getLabel(node:Node):string
    {
        let words = node.name.split(' ');
        if(words.length > 1) return words[0].charAt(0) + words[1].charAt(0).toLowerCase();
        return node.name.slice(0, 2);
    }

    private getXY(x:number, y:number):{x:number, y:number}
    {
        let gridX = Math.round(this.hexSize * 1.7);
        let gridY = Math.round(this.hexSize * 2);
        x = Math.round(x / gridX) * gridX;
        y = Math.round(y / gridY) * gridY;

        if((x % (gridX * 2)) == 0) y += gridY / 2;

        return {x: x, y: y};
    }

    private getPolygonPath(x:number, y:number, radius:number, sides:number = 6, startAngle:number = 0) 
    {
        let d = ''

        let xy = this.getXY(x, y);       
        
        range(sides).map(side => 
        {
            const angle = startAngle + 2 * Math.PI * side / sides
            return [xy.x + (radius * Math.cos(angle)), xy.y + (radius * Math.sin(angle))]
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

            // this.hexSize = this.sizeBy  * .06;
            // if(this.hexSize > 60) this.hexSize = 60;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));

            if(this.sim)
            {
                const links = this.getLinks(this.data.links);

                this.linkSelector.data(links)

                this.sim.force("link", forceLink(links).distance(d => d.distance))
                this.sim.force("center", forceCenter(this._width / 2, this._height / 2));
                this.sim.force("charge", forceManyBody().strength(-this.hexSize / 2))
                this.sim.restart();
            }
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };
    private get sizeBy() { return this._height > this._width ? this._width : this._height };

}