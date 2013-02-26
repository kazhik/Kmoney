package net.kazhik.android.kmoney;

import org.achartengine.ChartFactory;
import org.achartengine.GraphicalView;
import org.achartengine.model.CategorySeries;
import org.achartengine.renderer.DefaultRenderer;
import org.achartengine.renderer.SimpleSeriesRenderer;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.widget.RelativeLayout;

public class Chart {
	private GraphicalView mChartView2;
	static int count = 5;
	int[] Mycolors = new int[] { Color.RED, Color.DKGRAY, Color.BLUE,
			Color.parseColor("#800080"), Color.parseColor("#008000"),
			Color.GRAY };

	public Intent execute(Context context, RelativeLayout parent) {
		int[] colors = new int[count];
		for (int i = 0; i < count; i++) {
			colors[i] = Mycolors[i];
		}
		DefaultRenderer renderer = buildCategoryRenderer(colors);
		renderer.setPanEnabled(false);// Disable User Interaction
		renderer.setLabelsColor(Color.BLACK);
		renderer.setShowLabels(true);

		// renderer.setChartTitle("Total Assets");
		renderer.setLabelsTextSize(12);
		CategorySeries categorySeries = new CategorySeries("Pets");
		categorySeries.add("Dogs", 5);
		categorySeries.add("Cats", 6);
		categorySeries.add("Birds", 8);
		categorySeries.add("Fish", 23);
		categorySeries.add("Other Pets", 40);
		mChartView2 = ChartFactory.getPieChartView(context, categorySeries,
				renderer);
		parent.addView(mChartView2);
		return ChartFactory.getPieChartIntent(context, categorySeries,
				renderer, null);
	}

	protected DefaultRenderer buildCategoryRenderer(int[] colors) {
		DefaultRenderer renderer = new DefaultRenderer();
		for (int color : colors) {
			SimpleSeriesRenderer r = new SimpleSeriesRenderer();
			r.setColor(color);
			renderer.addSeriesRenderer(r);
		}
		return renderer;
	}
}
