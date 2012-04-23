import java.util.ArrayList;

public class Pattern {
	ArrayList<String> pattern = new ArrayList<String>();
	long excessPlates;
	double percent;
	
	public Pattern(long requiredPlates, long totalPlates) {
		this.excessPlates = totalPlates - requiredPlates;
		this.percent = Math.round(100 - ((double) requiredPlates/totalPlates)*100);
	}
}
