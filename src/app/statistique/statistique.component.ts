import {Component, OnInit} from "@angular/core";
import { Chart } from 'angular-highcharts';
import {DemoListeService} from "../demo-liste-service.service";

@Component({
  selector: 'app-statistique',
  templateUrl: './statistique.component.html',
  styleUrls: ['./statistique.component.css']
})
export class StatistiqueComponent  implements OnInit{
  chart?: Chart;

  constructor(private statisticService: DemoListeService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.statisticService.getStat().subscribe(data => {
      const categories = data.map(item => item.nom);
      const seriesData = data.map(item => item.count);

      this.chart = new Chart({
        chart: {
          type: 'column',
        },
        title: {
          text: 'Statistiques des patients par Provenance'
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: categories
        },
        yAxis: {
          title: {
            text: 'Patients'
          }
        },
        series: [
          {
            type: 'column',
            name: 'Provenance',
            data: seriesData
          }
        ]
      });
    });
  }
}


