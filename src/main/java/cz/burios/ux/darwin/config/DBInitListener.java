package cz.burios.ux.darwin.config;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import cz.burios.ux.darwin.db.DBContext;

@WebListener
public class DBInitListener implements ServletContextListener {

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		try {
			InitialContext ic = new InitialContext();
			DataSource ds = (DataSource) ic.lookup("java:comp/env/jdbc/JPADataSource");
			
			System.out.println("DBInitListener.contextInitialized().ds: " + ds);
			
			DBContext.setDataSource(ds);
			DBContext.initialize();
			// sce.getServletContext().setAttribute("DB_CONTEXT", DBContext);
			
			System.out.println("DBContext initialized with DataSource");
		} catch (Exception e) {
			throw new RuntimeException("Failed to initialize DBContext", e);
		}
	}
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    	DBContext.setDataSource(null);
    }
}