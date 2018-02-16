import { BASE_URL } from '../constants'
import { Patent, Facet, FacetValue } from '../models'

export class PatentService {
    query(endpoint) {
        return fetch(`${BASE_URL}/${endpoint}`).then(d => d.json())
    }
    search(q: string): Promise<Patent[]> {
        return this.query(`search?q=${q}&json=1`).then(d => {
            return d.result.hits.map((patent) => new Patent(patent))
        })
    }
    facets(q: string): Promise<Facet[]> {
        return this.query(`search/facetData?q=${q}`).then(d => {
            return this.createFacetsFromRawData(d.facets)
        })
    }
    createFacetsFromRawData(raw) {
        let facets: Facet[] = []
        Object.keys(raw).forEach(key => {
            let data = raw[key]
            let values: FacetValue[] = Object.keys(data).map(v => new FacetValue({
                key: v,
                label: data[v].displayName,
                value: data[v].count,
            }))
            let facet = new Facet({
                type: 'patent',
                key,
                values
            })
            facets.push(facet)
        })
        return facets
    }
}

export default PatentService
