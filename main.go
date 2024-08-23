package main

import (
	"fmt"
	"image/png"
	"log"
	"os"
	"math/rand"
	"math"
	"slices"
)

const PopCount = 5
const PolyCount = 2

type Vertex struct {
	X int
	Y int
}

type Poly struct {
	verts []Vertex
	color [4]int
}

type Edge struct {
	ends [2]Vertex
	slope float64
}

func randomPolyPopulation(w int, h int, v int) [][]Poly {
	fmt.Println(w, h)
	pop := make([][]Poly, PopCount)
	for i := range pop {
		pop[i] = make([]Poly, PolyCount)
		for j := range pop[i] {
			pop[i][j].color = [4]int{0, 0, 0, 1}
			pop[i][j].verts = make([]Vertex, v)
			for k := range pop[i][j].verts {
				pop[i][j].verts[k] = Vertex{rand.Intn(w), rand.Intn(h)}
			}
		}
	}
	return pop
}

func slope(p1 Vertex, p2 Vertex) float64 {
	if p1.X == p2.X {
		return math.MaxFloat64
	} else {
		return float64((p2.Y - p1.Y)) / float64((p2.X - p1.X))
	}
}

func edgesFromPoly(poly Poly) []Edge {
	edges := make([]Edge, len(poly.verts))
	for i := range poly.verts {
		if i == len(poly.verts)-1 {
			edges[i] = Edge{
				[2]Vertex{poly.verts[i], poly.verts[0]},
				slope(poly.verts[i], poly.verts[0]),
			}
		} else {
			edges[i] = Edge{
				[2]Vertex{poly.verts[i], poly.verts[i+1]},
				slope(poly.verts[i], poly.verts[i+1]),
			}
		}
	}
	return edges
}

func getNodeList(y int, edges []Edge) []Vertex {
	nodes := []Vertex{}
	for _, edge := range edges {
		if ((y == edge.ends[1].Y) || (y == edge.ends[0].Y)) && (math.Abs(edge.slope) < 1e-9) {
			nodes = append(nodes, Vertex{
				edge.ends[1].X,
				edge.ends[1].Y,
			})
		} else if (edge.ends[0].Y < y && edge.ends[1].Y > y) ||
			(edge.ends[0].Y > y && edge.ends[1].Y < y) ||
			(y == edge.ends[1].Y) {
			nodes = append(nodes, Vertex{
				int((float64(y - edge.ends[0].Y) / edge.slope) + float64(edge.ends[0].X)),
				y,
			})
		}
	}
	slices.SortFunc(nodes, func(a, b Vertex) int {
		if a.X < b.X {
			return -1
		} else if a.X > b.X {
			return 1
		} else {
			return 0
		}
	})
	return nodes
}

func main() {
	targetPath, err := os.Open("240x240_solid_red.png")
	if err != nil {
		log.Fatal(err)
	}
	outPath, err := os.Create("output.png")
	if err != nil {
		log.Fatal(err)
	}

	targetImg, err := png.Decode(targetPath)
	if err != nil {
		log.Fatal(err)
	}

	pop := randomPolyPopulation(targetImg.Bounds().Dx(), targetImg.Bounds().Dy(), 10)
	// pop := Poly{
	// 	[]Vertex{{10,10}, {20,30}, {40,10}}, [4]int{0,0,0,1},
	// }
	edges := edgesFromPoly(pop[0][0])
	nodes := getNodeList(100, edges)
	fmt.Println("=====Pop=====")
	fmt.Println(pop)
	fmt.Println("=====Edges=====")
	fmt.Println(edges)
	fmt.Println("=====Nodes=====")
	fmt.Println(nodes)

	err = png.Encode(outPath, targetImg)
	if err != nil {
		log.Fatal(err)
	}
}
