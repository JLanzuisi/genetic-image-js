package main

import (
	"fmt"
	"image/png"
	"log"
	"math"
	"math/rand"
	"os"
	"slices"
	"image"
	"image/color"
)

const PopCount = 5
const PolyCount = 5

type Vertex struct {
	X int
	Y int
}

type Poly struct {
	verts []Vertex
	color color.RGBA
}

type Edge struct {
	ends  [2]Vertex
	slope float64
}

func randomRegPoly(v int, w int, h int) []Vertex {
    verts := make([]Vertex, v)
	c := Vertex{rand.Intn(w), rand.Intn(h)}
	r := slices.Min([]int{c.X, c.Y, w-c.X, h-c.Y})
	t := rand.Float64() * 2.0 * math.Pi
	for i := range verts {
		verts[i] = Vertex{
		    int(float64(r) * math.Cos(2.0*math.Pi*float64(i)/float64(v) + t) + float64(c.X)),
		    int(float64(r) * math.Sin(2.0*math.Pi*float64(i)/float64(v) + t) + float64(c.Y)),
		}
	}
	return verts
}

func randomColor() color.RGBA {
    return color.RGBA{
        uint8(rand.Intn(255)),
        uint8(rand.Intn(255)),
        uint8(rand.Intn(255)),
        255,
    }
}

func randomPolyPopulation(w int, h int, v int) [][]Poly {
	fmt.Println(w, h)
	pop := make([][]Poly, PopCount)
	for i := range pop {
		pop[i] = make([]Poly, PolyCount)
		for j := range pop[i] {
			pop[i][j].color = randomColor()
			pop[i][j].verts = randomRegPoly(v, w, h)
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
				int((float64(y-edge.ends[0].Y) / edge.slope) + float64(edge.ends[0].X)),
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

func drawPoly(edges []Edge, im image.RGBA, col color.RGBA) {
	for y := range im.Bounds().Dy() {
	    nodes := getNodeList(y, edges)
	    if len(nodes) > 0 && len(nodes) % 2 == 0 {
	        for i := 0; i < len(nodes); i += 2 {
	            for x := nodes[i].X; x < nodes[i+1].X; x++ {
	                im.SetRGBA(x, y, col)
	            }
	        }
	    }
	}
}

func imDiff(im1 image.Image, im2 image.Image) float64 {
	if im1.Bounds().Dx() != im2.Bounds().Dx() || im1.Bounds().Dy() != im2.Bounds().Dy() {
		log.Fatal("Images have different sizes")
	}

	deltas := []uint32{}

	for x := range im1.Bounds().Dx() {
	    for y := range im1.Bounds().Dy() {
	        r1, g1, b1, _ := im1.At(x,y).RGBA()
	        r2, g2, b2, _ := im2.At(x,y).RGBA()
	        deltas = append(deltas, r1-r2, g1-g2, b1-b2)
	    }
	}

	var sum uint32 = 0
	for _, v := range deltas {
	    sum += v*v
	}

	return float64(sum) / float64(im1.Bounds().Dx() * im1.Bounds().Dx() * 3)
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

	pop := randomPolyPopulation(targetImg.Bounds().Dx(), targetImg.Bounds().Dy(), 3)

	outImg := image.NewRGBA(image.Rectangle{
		image.Point{0,0},
		image.Point{targetImg.Bounds().Dx(), targetImg.Bounds().Dy()},
	})

	for _, poly := range pop[0] {
	    edges := edgesFromPoly(poly)
	    drawPoly(edges, *outImg, poly.color)
	}
	fmt.Println(imDiff(targetImg, targetImg))
	err = png.Encode(outPath, outImg)
	if err != nil {
		log.Fatal(err)
	}
}
