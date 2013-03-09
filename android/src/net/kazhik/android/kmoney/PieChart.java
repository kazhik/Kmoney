package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.bean.PieChartValue;

import org.achartengine.ChartFactory;
import org.achartengine.GraphicalView;
import org.achartengine.model.CategorySeries;
import org.achartengine.renderer.DefaultRenderer;
import org.achartengine.renderer.SimpleSeriesRenderer;

import android.content.Context;
import android.graphics.Color;

public class PieChart {
	private Context context;
	private List<PieChartValue> chartData = new ArrayList<PieChartValue>();
	private static final List<Integer> colorList = Arrays.asList(
			Color.RED,
			Color.BLUE,
			Color.YELLOW,
			Color.GREEN,
			Color.GRAY,
			Color.CYAN,
			Color.MAGENTA,
			Color.LTGRAY);
	
	public PieChart(Context context) {
		this.context = context;

	}
	
	public void addValue(String key, BigDecimal value) {
		chartData.add(new PieChartValue(key, value));
		
	}
	public void clear() {
		this.chartData.clear();
	}
	public GraphicalView getPieChartView() {
		if (this.chartData.size() > PieChart.colorList.size()) {
			return null;
		}
		Iterator<PieChartValue> it = this.chartData.iterator();
		Iterator<Integer> itColor = PieChart.colorList.iterator();

		DefaultRenderer renderer = new DefaultRenderer();
		CategorySeries categorySeries = new CategorySeries("");
		while (it.hasNext()) {
			PieChartValue chartValue = it.next();
			
			categorySeries.add(chartValue.getName(), chartValue.getValue().doubleValue());
			
			SimpleSeriesRenderer r = new SimpleSeriesRenderer();
			r.setColor(itColor.next());
			renderer.addSeriesRenderer(r);
		}
		
		renderer.setPanEnabled(false);
		renderer.setShowLegend(false);
		renderer.setLabelsTextSize(renderer.getLabelsTextSize() * 2);
		return ChartFactory.getPieChartView(this.context, categorySeries,
				renderer);
	}


}
